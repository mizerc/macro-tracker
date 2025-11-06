# 🔥 Macro Tracker

A modern, beautiful web application for tracking your daily macros and nutrition with a comprehensive food database and meal builder.

## Features

### 🔥 Tracker Tab
- ✨ **Beautiful Modern UI** - Gradient backgrounds and smooth animations
- 📊 **Real-time Statistics** - Track calories, protein, carbs, fat, and fiber
- 🎯 **Macro Progress** - Visual progress bars for each macro goal
- ⚡ **Quick Add** - Instantly log foods with manual entry
- 🚀 **Quick Access** - One-click logging from saved foods and meals
- 📝 **Today's Log** - View all entries with timestamps

### 📋 Planner Tab
- 🎯 **Custom Goals** - Set personalized targets for calories and macros
- 📊 **Macro Breakdown** - Visual breakdown of your calorie distribution
- 🔄 **Quick Presets** - Choose from Balanced, High Protein, or Low Carb presets
- 🌾 **Fiber Tracking** - Set and monitor daily fiber goals
- 💡 **Smart Hints** - See calorie contributions from each macro as you set goals
- 💾 **Auto-Save** - Goals persist across sessions

### ☕ Foods Tab
- 🔍 **USDA Food Search** - Search the official USDA FoodData Central database
- 🗄️ **Food Database** - Create and save your frequently eaten foods
- 📏 **Serving Sizes** - Track serving size for each food
- 🔢 **Complete Macros** - Store calories, protein, carbs, and fat
- ➕ **Quick Logging** - Add saved foods to your tracker with one click
- ✏️ **Easy Management** - Edit and delete saved foods
- 🎯 **Auto-Fill** - Search results automatically fill the form with accurate nutritional data

### 🍽️ Meals Tab
- 🎯 **Meal Builder** - Create custom meals from your saved foods
- 🔢 **Quantity Control** - Set quantities for each food in a meal
- 📊 **Auto-Calculate** - Meal totals calculated automatically
- 💾 **Save Favorites** - Save your regular meals for quick logging
- 🍳 **Meal Templates** - Build breakfast, lunch, dinner templates

### 💾 General Features
- 📱 **Responsive Design** - Works great on all devices
- 💿 **Local Storage** - All data persists between sessions
- 🔒 **Privacy First** - Data never leaves your device
- ⚡ **Fast & Lightweight** - Built with React and Vite

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## How to Use

### Setting Your Goals
1. Navigate to the **Planner** tab
2. **Option A: Use Quick Presets**
   - Click on "Balanced", "High Protein", or "Low Carb" preset
   - Review the auto-filled values
   - Click "Save Goals"
3. **Option B: Set Custom Goals**
   - Enter your target calories
   - Set your desired protein, carbs, fat, and fiber goals
   - See real-time calorie breakdown as you adjust
   - Click "Save Goals"
4. Goals are automatically synced across all tabs

### Setting Up Your Food Database
1. Navigate to the **Foods** tab
2. **Option A: Search USDA Database** (Recommended)
   - Click "Search USDA Food Database"
   - Enter a food name (e.g., "chicken breast", "apple")
   - Browse results and click on the food you want
   - The form will auto-fill with accurate nutritional data
   - Adjust if needed and click "Save Food"
3. **Option B: Enter Manually**
   - Fill in the food name, serving size, and nutritional information
   - Click "Save Food" to add it to your database
4. Repeat for all your commonly eaten foods

### Creating Meals
1. Navigate to the **Meals** tab
2. Enter a meal name (e.g., "Breakfast", "Post-Workout")
3. Select foods from your database using the dropdown
4. Adjust quantities for each food
5. View the automatically calculated totals
6. Click "Save Meal" to add it to your meal library

### Tracking Your Daily Intake
1. Navigate to the **Tracker** tab
2. Set your daily calorie goal
3. Log items by:
   - **Quick Add**: Manually enter food details
   - **From Saved Foods**: One-click add from your food database
   - **From Saved Meals**: One-click add complete meals
4. Monitor your progress in real-time
5. View all entries in "Today's Log"
6. Delete any entries by mistake

### Tips for Best Results
- Pre-populate your food database with frequently eaten items
- Create meal templates for your regular meals
- Set a realistic daily calorie goal
- Track everything you eat for accurate totals

## Technologies Used

- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Lucide React** - Beautiful icons
- **Local Storage** - Data persistence

## Data Storage

All data is stored locally in your browser's localStorage. Your information never leaves your device, ensuring complete privacy.

## License

MIT License - feel free to use this project however you'd like!

