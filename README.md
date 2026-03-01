# 🤖 AI Financial Copilot

A production-ready Gen-AI powered personal finance management app built with React Native (Expo).

## 🏗️ Folder Structure

```
AIFinancialCopilot/
├── App.js                          # Root navigation + auth gate
├── app.json                        # Expo config
├── babel.config.js
├── package.json
└── src/
    ├── context/
    │   └── AppContext.js           # Global state (useReducer + Context)
    ├── screens/
    │   ├── OnboardingScreen.js     # 2-step profile setup
    │   ├── DashboardScreen.js      # Main overview + mode toggle
    │   ├── ExpenseTrackerScreen.js # Mode 1: Simple tracker + pie chart
    │   ├── CalendarScreen.js       # Color-coded monthly calendar
    │   ├── AICopilotScreen.js      # Mode 2: AI budget advisor
    │   ├── HealthScoreScreen.js    # Financial health score + bar chart
    │   └── AddExpenseScreen.js     # Add expense modal
    ├── services/
    │   ├── StorageService.js       # AsyncStorage layer (swappable w/ API)
    │   └── AIService.js            # OpenAI integration + mock fallback
    └── utils/
        ├── theme.js                # Design system (colors, spacing, etc.)
        └── financialUtils.js       # Financial calculation helpers
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android)

### Installation

```bash
# 1. Clone / extract the project
cd AIFinancialCopilot

# 2. Install dependencies
npm install

# 3. Start the dev server
npx expo start

# 4. Scan QR code with Expo Go app
```

### Running on simulators
```bash
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
```

## 🤖 Enable Real AI (Optional)

1. Get an OpenAI API key from https://platform.openai.com
2. Open `src/services/AIService.js`
3. Set: `const OPENAI_API_KEY = 'sk-your-key-here';`
4. The app uses `gpt-4o-mini` by default (cost-effective)

Without an API key, the app uses intelligent mock responses that demonstrate all functionality.

## ✨ Features

### Onboarding
- Choose user type: Student / Working Professional / Other
- Enter: Monthly Income, Fixed Expenses, Savings Goal
- Live budget breakdown preview
- Stored in AsyncStorage

### Dashboard
- Real-time budget overview
- Toggle between Simple and AI mode
- Recent transactions
- Savings goal tracking

### Simple Expense Tracker (Mode 1)
- Add expenses with categories (8 categories)
- Pie chart breakdown by category
- Filter transactions by category
- Delete transactions
- Color-coded category bars

### Calendar View
- Monthly calendar grid
- Color coding: Green (within limit) / Yellow (moderate) / Red (overspent)
- Tap any day to see detailed spending
- Per-day budget vs. spent comparison

### AI Copilot (Mode 2)
- Remaining budget + safe daily limit display
- Ask "Can I spend ₹X?" with any context
- Quick question shortcuts
- AI responds with: Decision (Approve/Caution/Reject) + Explanation + Strategy + Adjustment Plan + Behavioral Insight
- Query history
- Structured JSON AI response parsing

### Financial Health Score
- Score 0-100 based on 3 components:
  - Budget Adherence (40 pts)
  - Spending Consistency (30 pts)  
  - Savings Progress (30 pts)
- 7-day bar chart
- Personalized tips based on score
- Reset app option

## 🎨 Design System

Dark fintech theme:
- Background: `#0A0E1A`
- Accent: `#00D4AA` (teal-green)
- Status: Green / Yellow / Red for spending health
- Typography: Bold display weights, clear hierarchy

## 🔧 Backend Connection (Future)

The `StorageService.js` is designed for easy backend migration:

```javascript
// Current (AsyncStorage)
async getUserProfile() {
  const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return raw ? JSON.parse(raw) : null;
}

// Future (Node.js API)
async getUserProfile() {
  const res = await fetch(`${API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}
```

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `expo` | Framework |
| `@react-navigation/*` | Navigation |
| `@react-native-async-storage/async-storage` | Local storage |
| `react-native-chart-kit` | Pie + bar charts |
| `expo-linear-gradient` | UI gradients |
| `@expo/vector-icons` | Ionicons |
| `react-native-svg` | Chart rendering |

## 🏆 Hackathon Notes

This app demonstrates:
1. **Behavioral Finance AI** - Context-aware spending decisions
2. **Dual-mode architecture** - Simple vs. advanced user modes  
3. **Offline-first design** - Works without internet
4. **Production architecture** - Clean separation of concerns
5. **Real AI integration path** - Drop in your OpenAI key to activate

Built for: Students, working professionals, Gen-Z/Millennial users
Focus: Budgeting optimization, NOT stock prediction
