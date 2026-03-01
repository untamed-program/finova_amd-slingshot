// src/services/AIService.js - AI integration layer
// Supports mock mode and OpenAI API
// Set OPENAI_API_KEY to enable real AI responses

const OPENAI_API_KEY = ''; // Add your key here or via env
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * Build a structured prompt for the AI based on user context
 */
export const buildFinancialPrompt = ({
  userType,
  monthlyIncome,
  fixedExpenses,
  savingsGoal,
  remainingDays,
  remainingBudget,
  totalSpent,
  spendingRequest,
  question,
}) => {
  return `You are a personal financial advisor AI for a mobile budgeting app.
Respond ONLY with valid JSON. No extra text.

User Profile:
- Type: ${userType}
- Monthly Income: ₹${monthlyIncome}
- Fixed Expenses: ₹${fixedExpenses}
- Savings Goal: ₹${savingsGoal}
- Total Spent This Month: ₹${totalSpent}
- Remaining Budget: ₹${remainingBudget}
- Remaining Days in Month: ${remainingDays}
- Safe Daily Limit: ₹${Math.round(remainingBudget / Math.max(remainingDays, 1))}
- Spending Request: ₹${spendingRequest || 0}
- User Question: "${question || 'How is my budget looking?'}"

Analyze and respond with this exact JSON structure:
{
  "decision": "approve" | "caution" | "reject",
  "explanation": "Clear 1-2 sentence explanation",
  "strategy": "Specific actionable tip for this user type",
  "adjustment_plan": "If rejected or caution, suggest how to manage this expense",
  "health_tip": "One behavioral finance insight relevant to this situation"
}

Rules:
- approve: spending request <= 50% of safe daily limit
- caution: spending request between 50-100% of safe daily limit  
- reject: spending request > safe daily limit OR remaining budget < 0
- Be encouraging for students, analytical for professionals
- Keep responses concise and practical`;
};

/**
 * Mock AI responses for demo/no API key mode
 */
const generateMockResponse = ({ remainingBudget, remainingDays, spendingRequest, userType }) => {
  const dailyLimit = Math.round(remainingBudget / Math.max(remainingDays, 1));
  const req = spendingRequest || 0;

  let decision, explanation, strategy, adjustment_plan, health_tip;

  if (req <= 0) {
    decision = 'approve';
    explanation = `Your remaining budget is ₹${Math.round(remainingBudget)} with ${remainingDays} days left. Safe daily limit is ₹${dailyLimit}.`;
    strategy = userType === 'student'
      ? 'Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.'
      : 'Automate your savings at month start to avoid end-of-month crunch.';
    adjustment_plan = 'Continue tracking daily to stay on target.';
    health_tip = 'Small consistent habits beat large one-time efforts in finance.';
  } else if (req <= dailyLimit * 0.5) {
    decision = 'approve';
    explanation = `Spending ₹${req} is well within your daily limit of ₹${dailyLimit}. Go ahead!`;
    strategy = 'Great discipline! You can potentially accelerate your savings goal.';
    adjustment_plan = 'No adjustment needed — you\'re tracking well.';
    health_tip = 'Each mindful spending decision compounds into financial freedom.';
  } else if (req <= dailyLimit) {
    decision = 'caution';
    explanation = `₹${req} is within your daily limit of ₹${dailyLimit}, but leaves little buffer. Proceed mindfully.`;
    strategy = userType === 'student'
      ? 'Check if there\'s a cheaper alternative for this expense.'
      : 'Balance this with reduced discretionary spending tomorrow.';
    adjustment_plan = `Limit other spending to ₹${Math.max(dailyLimit - req, 0)} for the rest of today.`;
    health_tip = 'The pain of regret is greater than the pain of discipline.';
  } else {
    decision = 'reject';
    explanation = `₹${req} exceeds your safe daily limit of ₹${dailyLimit}. This could disrupt your savings goal.`;
    strategy = 'Defer this expense to next month or split it over multiple days.';
    adjustment_plan = `If urgent, reduce other expenses by ₹${req - dailyLimit} to compensate.`;
    health_tip = 'Delaying gratification is the strongest predictor of financial success.';
  }

  return { decision, explanation, strategy, adjustment_plan, health_tip };
};

/**
 * Main AI query function
 * Falls back to mock if no API key
 */
export const queryAI = async (context) => {
  // Return mock if no API key
  if (!OPENAI_API_KEY) {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      data: generateMockResponse(context),
      source: 'mock',
    };
  }

  try {
    const prompt = buildFinancialPrompt(context);

    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    // Parse JSON from AI response
    const parsed = JSON.parse(content);
    return { success: true, data: parsed, source: 'openai' };
  } catch (error) {
    console.error('AI API Error:', error);
    // Graceful fallback to mock
    return {
      success: true,
      data: generateMockResponse(context),
      source: 'mock_fallback',
    };
  }
};

/**
 * Generate monthly budget strategy
 */
export const generateMonthlyStrategy = async (profile, totalSpent) => {
  const remainingDays = Math.max(1, 30 - new Date().getDate());
  const disposable = profile.monthlyIncome - profile.fixedExpenses - profile.savingsGoal;
  const remainingBudget = Math.max(disposable - totalSpent, 0);

  return queryAI({
    userType: profile.userType,
    monthlyIncome: profile.monthlyIncome,
    fixedExpenses: profile.fixedExpenses,
    savingsGoal: profile.savingsGoal,
    remainingDays,
    remainingBudget,
    totalSpent,
    spendingRequest: 0,
    question: 'Give me an overall monthly budget strategy',
  });
};
