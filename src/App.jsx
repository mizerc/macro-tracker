import { useState, useEffect } from 'react'
import { Plus, Trash2, Target, TrendingUp, Flame, Coffee, UtensilsCrossed, BookOpen, Edit, Search, Loader, ClipboardList } from 'lucide-react'

function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('tracker')
  
  // Food Database
  const [savedFoods, setSavedFoods] = useState([])
  
  // Meals Database
  const [savedMeals, setSavedMeals] = useState([])
  
  // Today's log (foods and meals consumed)
  const [logEntries, setLogEntries] = useState([])
  
  // Goals (for backward compatibility, keep dailyGoal)
  const [dailyGoal, setDailyGoal] = useState(2000)
  const [goalInput, setGoalInput] = useState(2000)
  
  // Macro Goals
  const [macroGoals, setMacroGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    fiber: 25
  })
  
  const [macroGoalsInput, setMacroGoalsInput] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    fiber: 25
  })
  
  // USDA API Search
  const [usdaSearchQuery, setUsdaSearchQuery] = useState('')
  const [usdaSearchResults, setUsdaSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showUsdaSearch, setShowUsdaSearch] = useState(false)
  
  // Form states
  const [foodFormData, setFoodFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    servingSize: ''
  })
  
  const [mealFormData, setMealFormData] = useState({
    name: '',
    selectedFoods: []
  })
  
  const [quickLogForm, setQuickLogForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedSavedFoods = localStorage.getItem('savedFoods')
    const loadedSavedMeals = localStorage.getItem('savedMeals')
    const loadedLogEntries = localStorage.getItem('logEntries')
    const savedGoal = localStorage.getItem('dailyGoal')
    const savedMacroGoals = localStorage.getItem('macroGoals')
    
    if (loadedSavedFoods) {
      setSavedFoods(JSON.parse(loadedSavedFoods))
    }
    if (loadedSavedMeals) {
      setSavedMeals(JSON.parse(loadedSavedMeals))
    }
    if (loadedLogEntries) {
      setLogEntries(JSON.parse(loadedLogEntries))
    }
    if (savedGoal) {
      const goal = parseInt(savedGoal)
      setDailyGoal(goal)
      setGoalInput(goal)
    }
    if (savedMacroGoals) {
      const goals = JSON.parse(savedMacroGoals)
      setMacroGoals(goals)
      setMacroGoalsInput(goals)
      // Sync dailyGoal with macroGoals.calories
      setDailyGoal(goals.calories)
      setGoalInput(goals.calories)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('savedFoods', JSON.stringify(savedFoods))
  }, [savedFoods])

  useEffect(() => {
    localStorage.setItem('savedMeals', JSON.stringify(savedMeals))
  }, [savedMeals])

  useEffect(() => {
    localStorage.setItem('logEntries', JSON.stringify(logEntries))
  }, [logEntries])

  useEffect(() => {
    localStorage.setItem('dailyGoal', dailyGoal.toString())
  }, [dailyGoal])

  useEffect(() => {
    localStorage.setItem('macroGoals', JSON.stringify(macroGoals))
  }, [macroGoals])

  // USDA API Search Handlers
  const searchUsdaFoods = async () => {
    if (!usdaSearchQuery.trim()) {
      alert('Please enter a search term')
      return
    }

    setIsSearching(true)
    setUsdaSearchResults([])

    try {
      // Using the public USDA FoodData Central API
      const apiKey = 'DEMO_KEY' // Users can get their own key from api.data.gov
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(usdaSearchQuery)}&pageSize=10`
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setUsdaSearchResults(data.foods || [])
    } catch (error) {
      console.error('USDA API Error:', error)
      alert('Failed to search foods. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const selectUsdaFood = (food) => {
    // Extract nutrients from the USDA food data
    const nutrients = food.foodNutrients || []
    
    const getnutrient = (nutrientId) => {
      const nutrient = nutrients.find(n => n.nutrientId === nutrientId)
      return nutrient ? Math.round(nutrient.value) : 0
    }

    // Nutrient IDs in USDA database:
    // 1008 = Energy (kcal)
    // 1003 = Protein
    // 1005 = Carbohydrates
    // 1004 = Total Fat
    
    const calories = getnutrient(1008)
    const protein = getnutrient(1003)
    const carbs = getnutrient(1005)
    const fat = getnutrient(1004)

    // Auto-fill the form
    setFoodFormData({
      name: food.description || '',
      calories: calories.toString(),
      protein: protein.toString(),
      carbs: carbs.toString(),
      fat: fat.toString(),
      fiber: '0',
      servingSize: food.servingSize ? `${food.servingSize} ${food.servingSizeUnit || 'g'}` : '100g'
    })

    // Close search modal
    setShowUsdaSearch(false)
    setUsdaSearchQuery('')
    setUsdaSearchResults([])
  }

  // Food Database Handlers
  const handleFoodFormChange = (e) => {
    const { name, value } = e.target
    setFoodFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveFood = (e) => {
    e.preventDefault()
    if (!foodFormData.name || !foodFormData.calories) {
      alert('Please enter at least food name and calories')
      return
    }

    const newFood = {
      id: Date.now(),
      name: foodFormData.name,
      calories: parseInt(foodFormData.calories) || 0,
      protein: parseInt(foodFormData.protein) || 0,
      carbs: parseInt(foodFormData.carbs) || 0,
      fat: parseInt(foodFormData.fat) || 0,
      fiber: parseInt(foodFormData.fiber) || 0,
      servingSize: foodFormData.servingSize || '1 serving'
    }

    setSavedFoods(prev => [newFood, ...prev])
    setFoodFormData({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', servingSize: '' })
  }

  const handleDeleteFood = (id) => {
    setSavedFoods(prev => prev.filter(food => food.id !== id))
  }

  // Meal Builder Handlers
  const handleMealFormChange = (e) => {
    const { name, value } = e.target
    setMealFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddFoodToMeal = (foodId) => {
    const food = savedFoods.find(f => f.id === parseInt(foodId))
    if (!food) return

    setMealFormData(prev => ({
      ...prev,
      selectedFoods: [...prev.selectedFoods, { ...food, quantity: 1 }]
    }))
  }

  const handleRemoveFoodFromMeal = (index) => {
    setMealFormData(prev => ({
      ...prev,
      selectedFoods: prev.selectedFoods.filter((_, i) => i !== index)
    }))
  }

  const handleFoodQuantityChange = (index, quantity) => {
    setMealFormData(prev => ({
      ...prev,
      selectedFoods: prev.selectedFoods.map((food, i) => 
        i === index ? { ...food, quantity: parseInt(quantity) || 1 } : food
      )
    }))
  }

  const calculateMealTotals = (foods) => {
    return foods.reduce((totals, food) => ({
      calories: totals.calories + (food.calories * food.quantity),
      protein: totals.protein + (food.protein * food.quantity),
      carbs: totals.carbs + (food.carbs * food.quantity),
      fat: totals.fat + (food.fat * food.quantity),
      fiber: totals.fiber + ((food.fiber || 0) * food.quantity)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
  }

  const handleSaveMeal = (e) => {
    e.preventDefault()
    if (!mealFormData.name || mealFormData.selectedFoods.length === 0) {
      alert('Please enter a meal name and add at least one food')
      return
    }

    const totals = calculateMealTotals(mealFormData.selectedFoods)
    const newMeal = {
      id: Date.now(),
      name: mealFormData.name,
      foods: mealFormData.selectedFoods,
      ...totals
    }

    setSavedMeals(prev => [newMeal, ...prev])
    setMealFormData({ name: '', selectedFoods: [] })
  }

  const handleDeleteMeal = (id) => {
    setSavedMeals(prev => prev.filter(meal => meal.id !== id))
  }

  // Tracker Handlers
  const handleQuickLogChange = (e) => {
    const { name, value } = e.target
    setQuickLogForm(prev => ({ ...prev, [name]: value }))
  }

  const handleQuickLog = (e) => {
    e.preventDefault()
    if (!quickLogForm.name || !quickLogForm.calories) {
      alert('Please enter at least food name and calories')
      return
    }

    const newEntry = {
      id: Date.now(),
      type: 'quick',
      name: quickLogForm.name,
      calories: parseInt(quickLogForm.calories) || 0,
      protein: parseInt(quickLogForm.protein) || 0,
      carbs: parseInt(quickLogForm.carbs) || 0,
      fat: parseInt(quickLogForm.fat) || 0,
      fiber: parseInt(quickLogForm.fiber) || 0,
      timestamp: new Date().toISOString()
    }

    setLogEntries(prev => [newEntry, ...prev])
    setQuickLogForm({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' })
  }

  const handleLogSavedFood = (food) => {
    const newEntry = {
      id: Date.now(),
      type: 'food',
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      timestamp: new Date().toISOString()
    }
    setLogEntries(prev => [newEntry, ...prev])
  }

  const handleLogMeal = (meal) => {
    const newEntry = {
      id: Date.now(),
      type: 'meal',
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      fiber: meal.fiber || 0,
      foods: meal.foods,
      timestamp: new Date().toISOString()
    }
    setLogEntries(prev => [newEntry, ...prev])
  }

  const handleDeleteLogEntry = (id) => {
    setLogEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const handleSetGoal = () => {
    if (goalInput > 0) {
      setDailyGoal(goalInput)
    }
  }

  // Planner/Goals Handlers
  const handleMacroGoalsChange = (e) => {
    const { name, value } = e.target
    setMacroGoalsInput(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleSaveMacroGoals = (e) => {
    e.preventDefault()
    setMacroGoals(macroGoalsInput)
    // Sync dailyGoal with calories
    setDailyGoal(macroGoalsInput.calories)
    setGoalInput(macroGoalsInput.calories)
    alert('Goals saved successfully!')
  }

  // Calculate totals from log entries
  const totalCalories = logEntries.reduce((sum, entry) => sum + entry.calories, 0)
  const totalProtein = logEntries.reduce((sum, entry) => sum + entry.protein, 0)
  const totalCarbs = logEntries.reduce((sum, entry) => sum + entry.carbs, 0)
  const totalFat = logEntries.reduce((sum, entry) => sum + entry.fat, 0)
  const totalFiber = logEntries.reduce((sum, entry) => sum + (entry.fiber || 0), 0)
  const remaining = macroGoals.calories - totalCalories
  const progress = Math.min((totalCalories / macroGoals.calories) * 100, 100)

  // Calculate macro percentages
  const proteinProgress = macroGoals.protein > 0 ? Math.min((totalProtein / macroGoals.protein) * 100, 100) : 0
  const carbsProgress = macroGoals.carbs > 0 ? Math.min((totalCarbs / macroGoals.carbs) * 100, 100) : 0
  const fatProgress = macroGoals.fat > 0 ? Math.min((totalFat / macroGoals.fat) * 100, 100) : 0
  const fiberProgress = macroGoals.fiber > 0 ? Math.min((totalFiber / macroGoals.fiber) * 100, 100) : 0

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🔥 Macro Tracker</h1>
        <p>Track your daily nutrition and reach your goals</p>
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            <Flame size={20} />
            Tracker
          </button>
          <button 
            className={`tab-btn ${activeTab === 'planner' ? 'active' : ''}`}
            onClick={() => setActiveTab('planner')}
          >
            <ClipboardList size={20} />
            Planner
          </button>
          <button 
            className={`tab-btn ${activeTab === 'foods' ? 'active' : ''}`}
            onClick={() => setActiveTab('foods')}
          >
            <Coffee size={20} />
            Foods
          </button>
          <button 
            className={`tab-btn ${activeTab === 'meals' ? 'active' : ''}`}
            onClick={() => setActiveTab('meals')}
          >
            <UtensilsCrossed size={20} />
            Meals
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* TRACKER TAB */}
        {activeTab === 'tracker' && (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
            <div className="stat-card primary">
            <div className="stat-label">Today's Calories</div>
            <div className="stat-value">{totalCalories}</div>
            <div className="stat-subtext">of {macroGoals.calories} kcal</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-label">Remaining</div>
            <div className="stat-value" style={{ color: remaining < 0 ? '#D86C70' : 'inherit' }}>
              {remaining}
            </div>
            <div className="stat-subtext">kcal {remaining < 0 ? 'over' : 'left'}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Protein</div>
            <div className="stat-value" style={{ fontSize: '2rem' }}>{totalProtein}g</div>
            <div className="stat-subtext">of {macroGoals.protein}g</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${proteinProgress}%`, background: '#6B9080' }}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Carbs</div>
            <div className="stat-value" style={{ fontSize: '2rem' }}>{totalCarbs}g</div>
            <div className="stat-subtext">of {macroGoals.carbs}g</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${carbsProgress}%`, background: '#A4C3B2' }}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Fat</div>
            <div className="stat-value" style={{ fontSize: '2rem' }}>{totalFat}g</div>
            <div className="stat-subtext">of {macroGoals.fat}g</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${fatProgress}%`, background: '#8B6F47' }}></div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-label">Fiber</div>
            <div className="stat-value" style={{ fontSize: '2rem' }}>{totalFiber}g</div>
            <div className="stat-subtext">of {macroGoals.fiber}g</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${fiberProgress}%`, background: '#5a7a6d' }}></div>
            </div>
          </div>
            </div>

            {/* Daily Goal Setting */}
            <div className="section" style={{ marginBottom: '30px' }}>
              <div className="goal-input-group">
                <div className="form-group">
                  <label><Target size={16} style={{ display: 'inline', marginRight: '5px' }} />Daily Goal (kcal)</label>
                  <input
                    type="number"
                    value={goalInput}
                    onChange={(e) => setGoalInput(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <button className="btn btn-primary" onClick={handleSetGoal} style={{ width: 'auto' }}>
                  Set Goal
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
              {/* Quick Log Form */}
              <div className="section">
                <h2>Quick Add</h2>
                <form onSubmit={handleQuickLog}>
                  <div className="form-group">
                    <label>Food Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={quickLogForm.name}
                      onChange={handleQuickLogChange}
                      placeholder="e.g., Chicken breast"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Calories (kcal) *</label>
                    <input
                      type="number"
                      name="calories"
                      value={quickLogForm.calories}
                      onChange={handleQuickLogChange}
                      placeholder="e.g., 165"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input
                      type="number"
                      name="protein"
                      value={quickLogForm.protein}
                      onChange={handleQuickLogChange}
                      placeholder="e.g., 31"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input
                      type="number"
                      name="carbs"
                      value={quickLogForm.carbs}
                      onChange={handleQuickLogChange}
                      placeholder="e.g., 0"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Fat (g)</label>
                    <input
                      type="number"
                      name="fat"
                      value={quickLogForm.fat}
                      onChange={handleQuickLogChange}
                      placeholder="e.g., 3.6"
                      min="0"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <Plus size={20} />
                    Quick Add
                  </button>
                </form>

                {/* Saved Foods Quick Access */}
                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#333' }}>From Saved Foods</h3>
                  {savedFoods.length === 0 ? (
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>No saved foods yet. Create some in the Foods tab!</p>
                  ) : (
                    <div className="quick-add-list">
                      {savedFoods.slice(0, 5).map(food => (
                        <button
                          key={food.id}
                          className="quick-add-btn"
                          onClick={() => handleLogSavedFood(food)}
                        >
                          <Plus size={16} />
                          {food.name} ({food.calories} kcal)
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved Meals Quick Access */}
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#333' }}>From Saved Meals</h3>
                  {savedMeals.length === 0 ? (
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>No saved meals yet. Create some in the Meals tab!</p>
                  ) : (
                    <div className="quick-add-list">
                      {savedMeals.slice(0, 5).map(meal => (
                        <button
                          key={meal.id}
                          className="quick-add-btn"
                          onClick={() => handleLogMeal(meal)}
                        >
                          <Plus size={16} />
                          {meal.name} ({meal.calories} kcal)
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Today's Log */}
              <div className="section">
                <h2>Today's Log</h2>
                <div className="food-list">
                  {logEntries.length === 0 ? (
                    <div className="empty-state">
                      <Flame size={48} />
                      <p>No entries yet.</p>
                      <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Start tracking your meals!</p>
                    </div>
                  ) : (
                    logEntries.map(entry => (
                      <div key={entry.id} className="food-item">
                        <div className="food-info">
                          <h3>
                            {entry.name}
                            {entry.type === 'meal' && <span className="badge-meal">Meal</span>}
                          </h3>
                          <div className="food-details">
                            <span><strong>{entry.calories}</strong> kcal</span>
                            {entry.protein > 0 && <span>P: {entry.protein}g</span>}
                            {entry.carbs > 0 && <span>C: {entry.carbs}g</span>}
                            {entry.fat > 0 && <span>F: {entry.fat}g</span>}
                            <span className="time-badge">{formatTime(entry.timestamp)}</span>
                          </div>
                        </div>
                        <div className="food-actions">
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleDeleteLogEntry(entry.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* PLANNER TAB */}
        {activeTab === 'planner' && (
          <div className="planner-container">
            <div className="planner-intro">
              <h2>Set Your Daily Goals</h2>
              <p>Customize your daily calorie and macro targets to match your nutrition goals.</p>
            </div>

            <div className="planner-grid">
              {/* Current Goals Overview */}
              <div className="section goals-overview">
                <h3>Current Goals</h3>
                <div className="goals-display">
                  <div className="goal-display-item primary">
                    <div className="goal-icon">🔥</div>
                    <div className="goal-info">
                      <span className="goal-label">Calories</span>
                      <span className="goal-value">{macroGoals.calories} kcal</span>
                    </div>
                  </div>
                  
                  <div className="goal-display-item">
                    <div className="goal-icon">🥩</div>
                    <div className="goal-info">
                      <span className="goal-label">Protein</span>
                      <span className="goal-value">{macroGoals.protein}g</span>
                    </div>
                  </div>
                  
                  <div className="goal-display-item">
                    <div className="goal-icon">🍞</div>
                    <div className="goal-info">
                      <span className="goal-label">Carbs</span>
                      <span className="goal-value">{macroGoals.carbs}g</span>
                    </div>
                  </div>
                  
                  <div className="goal-display-item">
                    <div className="goal-icon">🥑</div>
                    <div className="goal-info">
                      <span className="goal-label">Fat</span>
                      <span className="goal-value">{macroGoals.fat}g</span>
                    </div>
                  </div>
                  
                  <div className="goal-display-item">
                    <div className="goal-icon">🌾</div>
                    <div className="goal-info">
                      <span className="goal-label">Fiber</span>
                      <span className="goal-value">{macroGoals.fiber}g</span>
                    </div>
                  </div>
                </div>

                {/* Macro Breakdown */}
                <div className="macro-breakdown">
                  <h4>Calorie Breakdown</h4>
                  <div className="breakdown-bars">
                    <div className="breakdown-item">
                      <div className="breakdown-label">
                        <span>Protein ({macroGoals.protein}g)</span>
                        <span>{Math.round((macroGoals.protein * 4 / macroGoals.calories) * 100)}%</span>
                      </div>
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill protein"
                          style={{ width: `${(macroGoals.protein * 4 / macroGoals.calories) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="breakdown-item">
                      <div className="breakdown-label">
                        <span>Carbs ({macroGoals.carbs}g)</span>
                        <span>{Math.round((macroGoals.carbs * 4 / macroGoals.calories) * 100)}%</span>
                      </div>
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill carbs"
                          style={{ width: `${(macroGoals.carbs * 4 / macroGoals.calories) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="breakdown-item">
                      <div className="breakdown-label">
                        <span>Fat ({macroGoals.fat}g)</span>
                        <span>{Math.round((macroGoals.fat * 9 / macroGoals.calories) * 100)}%</span>
                      </div>
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill fat"
                          style={{ width: `${(macroGoals.fat * 9 / macroGoals.calories) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Goals Form */}
              <div className="section">
                <h3>Edit Goals</h3>
                <form onSubmit={handleSaveMacroGoals}>
                  <div className="form-group">
                    <label>
                      <span className="label-icon">🔥</span>
                      Daily Calories (kcal) *
                    </label>
                    <input
                      type="number"
                      name="calories"
                      value={macroGoalsInput.calories}
                      onChange={handleMacroGoalsChange}
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="label-icon">🥩</span>
                      Protein (g) *
                    </label>
                    <input
                      type="number"
                      name="protein"
                      value={macroGoalsInput.protein}
                      onChange={handleMacroGoalsChange}
                      min="0"
                      required
                    />
                    <span className="input-hint">{Math.round(macroGoalsInput.protein * 4)} calories from protein</span>
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="label-icon">🍞</span>
                      Carbohydrates (g) *
                    </label>
                    <input
                      type="number"
                      name="carbs"
                      value={macroGoalsInput.carbs}
                      onChange={handleMacroGoalsChange}
                      min="0"
                      required
                    />
                    <span className="input-hint">{Math.round(macroGoalsInput.carbs * 4)} calories from carbs</span>
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="label-icon">🥑</span>
                      Fat (g) *
                    </label>
                    <input
                      type="number"
                      name="fat"
                      value={macroGoalsInput.fat}
                      onChange={handleMacroGoalsChange}
                      min="0"
                      required
                    />
                    <span className="input-hint">{Math.round(macroGoalsInput.fat * 9)} calories from fat</span>
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="label-icon">🌾</span>
                      Fiber (g) *
                    </label>
                    <input
                      type="number"
                      name="fiber"
                      value={macroGoalsInput.fiber}
                      onChange={handleMacroGoalsChange}
                      min="0"
                      required
                    />
                    <span className="input-hint">Recommended: 25-38g per day</span>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <Target size={20} />
                    Save Goals
                  </button>
                </form>

                {/* Quick Presets */}
                <div className="goal-presets">
                  <h4>Quick Presets</h4>
                  <div className="preset-buttons">
                    <button
                      type="button"
                      className="preset-btn"
                      onClick={() => setMacroGoalsInput({ calories: 2000, protein: 150, carbs: 200, fat: 65, fiber: 28 })}
                    >
                      Balanced
                    </button>
                    <button
                      type="button"
                      className="preset-btn"
                      onClick={() => setMacroGoalsInput({ calories: 2200, protein: 180, carbs: 220, fat: 70, fiber: 30 })}
                    >
                      High Protein
                    </button>
                    <button
                      type="button"
                      className="preset-btn"
                      onClick={() => setMacroGoalsInput({ calories: 1800, protein: 120, carbs: 150, fat: 80, fiber: 25 })}
                    >
                      Low Carb
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOODS TAB */}
        {activeTab === 'foods' && (
          <>
            {/* USDA Search Modal */}
            {showUsdaSearch && (
              <div className="modal-overlay" onClick={() => setShowUsdaSearch(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Search USDA Food Database</h2>
                    <button 
                      className="modal-close"
                      onClick={() => setShowUsdaSearch(false)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="modal-body">
                    <div className="usda-search-box">
                      <input
                        type="text"
                        value={usdaSearchQuery}
                        onChange={(e) => setUsdaSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchUsdaFoods()}
                        placeholder="Search for foods... (e.g., chicken breast, apple)"
                        className="usda-search-input"
                      />
                      <button
                        onClick={searchUsdaFoods}
                        disabled={isSearching}
                        className="btn btn-primary"
                        style={{ width: 'auto' }}
                      >
                        {isSearching ? <Loader size={20} className="spinner" /> : <Search size={20} />}
                        Search
                      </button>
                    </div>

                    {isSearching && (
                      <div className="usda-loading">
                        <Loader size={32} className="spinner" />
                        <p>Searching USDA database...</p>
                      </div>
                    )}

                    {!isSearching && usdaSearchResults.length > 0 && (
                      <div className="usda-results">
                        <p className="usda-results-count">{usdaSearchResults.length} results found</p>
                        {usdaSearchResults.map((food, index) => {
                          const nutrients = food.foodNutrients || []
                          const calories = nutrients.find(n => n.nutrientId === 1008)?.value || 0
                          const protein = nutrients.find(n => n.nutrientId === 1003)?.value || 0
                          
                          return (
                            <div 
                              key={index} 
                              className="usda-result-item"
                              onClick={() => selectUsdaFood(food)}
                            >
                              <div className="usda-result-info">
                                <h3>{food.description}</h3>
                                <div className="usda-result-details">
                                  <span className="usda-brand">{food.brandOwner || food.dataType}</span>
                                  <span><strong>{Math.round(calories)}</strong> kcal</span>
                                  {protein > 0 && <span>P: {Math.round(protein)}g</span>}
                                </div>
                              </div>
                              <div className="usda-select-btn">
                                <Plus size={20} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {!isSearching && usdaSearchResults.length === 0 && usdaSearchQuery && (
                      <div className="empty-state">
                        <Search size={48} />
                        <p>No results found. Try a different search term.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="content-grid">
              {/* Create Food Form */}
              <div className="section">
                <h2>Create Food</h2>
                
                {/* USDA Search Button */}
                <button 
                  type="button"
                  className="btn-usda-search"
                  onClick={() => setShowUsdaSearch(true)}
                >
                  <Search size={18} />
                  Search USDA Food Database
                </button>

                <div className="form-divider">
                  <span>or enter manually</span>
                </div>

                <form onSubmit={handleSaveFood}>
                <div className="form-group">
                  <label>Food Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={foodFormData.name}
                    onChange={handleFoodFormChange}
                    placeholder="e.g., Chicken breast"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Serving Size</label>
                  <input
                    type="text"
                    name="servingSize"
                    value={foodFormData.servingSize}
                    onChange={handleFoodFormChange}
                    placeholder="e.g., 100g, 1 cup"
                  />
                </div>

                <div className="form-group">
                  <label>Calories (kcal) *</label>
                  <input
                    type="number"
                    name="calories"
                    value={foodFormData.calories}
                    onChange={handleFoodFormChange}
                    placeholder="e.g., 165"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Protein (g)</label>
                  <input
                    type="number"
                    name="protein"
                    value={foodFormData.protein}
                    onChange={handleFoodFormChange}
                    placeholder="e.g., 31"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Carbs (g)</label>
                  <input
                    type="number"
                    name="carbs"
                    value={foodFormData.carbs}
                    onChange={handleFoodFormChange}
                    placeholder="e.g., 0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Fat (g)</label>
                  <input
                    type="number"
                    name="fat"
                    value={foodFormData.fat}
                    onChange={handleFoodFormChange}
                    placeholder="e.g., 3.6"
                    min="0"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  <Plus size={20} />
                  Save Food
                </button>
              </form>
            </div>

            {/* Saved Foods List */}
            <div className="section">
              <h2>Your Foods ({savedFoods.length})</h2>
              <div className="food-list">
                {savedFoods.length === 0 ? (
                  <div className="empty-state">
                    <Coffee size={48} />
                    <p>No foods saved yet.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Create your food database!</p>
                  </div>
                ) : (
                  savedFoods.map(food => (
                    <div key={food.id} className="food-item">
                      <div className="food-info">
                        <h3>{food.name}</h3>
                        <div className="food-details">
                          <span className="serving-badge">{food.servingSize}</span>
                          <span><strong>{food.calories}</strong> kcal</span>
                          {food.protein > 0 && <span>P: {food.protein}g</span>}
                          {food.carbs > 0 && <span>C: {food.carbs}g</span>}
                          {food.fat > 0 && <span>F: {food.fat}g</span>}
                        </div>
                      </div>
                      <div className="food-actions">
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                          onClick={() => handleLogSavedFood(food)}
                        >
                          <Plus size={16} />
                          Log
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteFood(food.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          </>
        )}

        {/* MEALS TAB */}
        {activeTab === 'meals' && (
          <div className="content-grid">
            {/* Create Meal Form */}
            <div className="section">
              <h2>Create Meal</h2>
              <form onSubmit={handleSaveMeal}>
                <div className="form-group">
                  <label>Meal Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={mealFormData.name}
                    onChange={handleMealFormChange}
                    placeholder="e.g., Breakfast, Lunch"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Add Foods</label>
                  <select 
                    onChange={(e) => {
                      handleAddFoodToMeal(e.target.value)
                      e.target.value = ''
                    }}
                    className="food-select"
                  >
                    <option value="">Select a food...</option>
                    {savedFoods.map(food => (
                      <option key={food.id} value={food.id}>
                        {food.name} ({food.calories} kcal)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Foods for Meal */}
                {mealFormData.selectedFoods.length > 0 && (
                  <div className="meal-foods">
                    <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#555' }}>Foods in this meal:</h3>
                    {mealFormData.selectedFoods.map((food, index) => (
                      <div key={index} className="meal-food-item">
                        <div className="meal-food-info">
                          <span>{food.name}</span>
                          <span className="meal-food-macros">
                            {food.calories * food.quantity} kcal
                          </span>
                        </div>
                        <div className="meal-food-controls">
                          <input
                            type="number"
                            value={food.quantity}
                            onChange={(e) => handleFoodQuantityChange(index, e.target.value)}
                            min="1"
                            className="quantity-input"
                          />
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '4px 8px' }}
                            onClick={() => handleRemoveFoodFromMeal(index)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Meal Totals */}
                    <div className="meal-totals">
                      <h4>Meal Totals:</h4>
                      <div className="meal-totals-grid">
                        <span><strong>Calories:</strong> {calculateMealTotals(mealFormData.selectedFoods).calories} kcal</span>
                        <span><strong>Protein:</strong> {calculateMealTotals(mealFormData.selectedFoods).protein}g</span>
                        <span><strong>Carbs:</strong> {calculateMealTotals(mealFormData.selectedFoods).carbs}g</span>
                        <span><strong>Fat:</strong> {calculateMealTotals(mealFormData.selectedFoods).fat}g</span>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={mealFormData.selectedFoods.length === 0}
                >
                  <Plus size={20} />
                  Save Meal
                </button>
              </form>
            </div>

            {/* Saved Meals List */}
            <div className="section">
              <h2>Your Meals ({savedMeals.length})</h2>
              <div className="food-list">
                {savedMeals.length === 0 ? (
                  <div className="empty-state">
                    <UtensilsCrossed size={48} />
                    <p>No meals saved yet.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Create meals from your foods!</p>
                  </div>
                ) : (
                  savedMeals.map(meal => (
                    <div key={meal.id} className="food-item">
                      <div className="food-info">
                        <h3>{meal.name}</h3>
                        <div className="food-details">
                          <span><strong>{meal.calories}</strong> kcal</span>
                          {meal.protein > 0 && <span>P: {meal.protein}g</span>}
                          {meal.carbs > 0 && <span>C: {meal.carbs}g</span>}
                          {meal.fat > 0 && <span>F: {meal.fat}g</span>}
                          <span className="time-badge">{meal.foods.length} items</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '5px' }}>
                          {meal.foods.map((f, i) => (
                            <span key={i}>
                              {f.name} ({f.quantity}x){i < meal.foods.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="food-actions">
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                          onClick={() => handleLogMeal(meal)}
                        >
                          <Plus size={16} />
                          Log
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteMeal(meal.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

