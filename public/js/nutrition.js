// Nutrition Data
let nutritionData = {
    dailyGoals: {
        calories: 2400,
        protein: 160,
        carbs: 320,
        fats: 80,
        water: 3000 // in ml
    },
    meals: [],
    waterIntake: 0
};

// Load data from localStorage
document.addEventListener('DOMContentLoaded', () => {
    loadNutritionData();
    setupEventListeners();
    updateUI();
});

function loadNutritionData() {
    const savedData = localStorage.getItem('nutritionData');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        // Only load today's data
        if (isToday(new Date(parsed.date))) {
            nutritionData = { ...nutritionData, ...parsed };
        }
    }
}

function setupEventListeners() {
    // Log Meal Button
    const logMealBtn = document.querySelector('.log-meal-btn');
    logMealBtn?.addEventListener('click', openMealLogger);

    // Add Water Button
    const addWaterBtn = document.querySelector('.add-water-btn');
    addWaterBtn?.addEventListener('click', addWater);

    // Quick Add Buttons (if any)
    document.querySelectorAll('.quick-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const foodItem = e.target.dataset.food;
            quickAddFood(foodItem);
        });
    });
}

function updateUI() {
    updateCalorieCircle();
    updateMacroProgress();
    updateWaterProgress();
    updateGoals();
}

function updateCalorieCircle() {
    const consumed = calculateTotalCalories();
    const target = nutritionData.dailyGoals.calories;
    const percentage = Math.min((consumed / target) * 100, 100);

    // Update the SVG circle
    const circle = document.querySelector('.circular-chart path');
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${percentage}, 100`);
    }

    // Update the numbers
    document.querySelector('.calories-consumed').textContent = consumed.toLocaleString();
    document.querySelector('.total-calories').textContent = `/ ${target.toLocaleString()}`;
}

function updateMacroProgress() {
    const macros = calculateTotalMacros();
    
    // Update protein bar
    updateMacroBar('protein', macros.protein, nutritionData.dailyGoals.protein);
    
    // Update carbs bar
    updateMacroBar('carbs', macros.carbs, nutritionData.dailyGoals.carbs);
    
    // Update fats bar
    updateMacroBar('fats', macros.fats, nutritionData.dailyGoals.fats);
}

function updateMacroBar(macro, current, target) {
    const percentage = Math.min((current / target) * 100, 100);
    const macroEl = document.querySelector(`.macro.${macro}`);
    if (macroEl) {
        const bar = macroEl.querySelector('.macro-bar');
        const value = macroEl.querySelector('.macro-value');
        bar.style.width = `${percentage}%`;
        value.textContent = `${Math.round(current)}g / ${target}g`;
    }
}

function updateWaterProgress() {
    const percentage = (nutritionData.waterIntake / nutritionData.dailyGoals.water) * 100;
    const glasses = Math.floor(nutritionData.waterIntake / 250); // 250ml per glass
    
    // Update water bars
    document.querySelectorAll('.water-bar').forEach((bar, index) => {
        bar.classList.toggle('filled', index < glasses);
    });
    
    // Update water stats
    document.querySelector('.water-stats .current').textContent = 
        `${(nutritionData.waterIntake / 1000).toFixed(1)}L`;
}

function updateGoals() {
    const consumed = calculateTotalCalories();
    const macros = calculateTotalMacros();
    
    // Update calorie goal status
    updateGoalStatus(
        'calorie',
        consumed <= nutritionData.dailyGoals.calories,
        consumed >= nutritionData.dailyGoals.calories * 0.9
    );
    
    // Update protein goal status
    updateGoalStatus(
        'protein',
        macros.protein >= nutritionData.dailyGoals.protein,
        macros.protein >= nutritionData.dailyGoals.protein * 0.8
    );
    
    // Update water goal status
    updateGoalStatus(
        'water',
        nutritionData.waterIntake >= nutritionData.dailyGoals.water,
        nutritionData.waterIntake >= nutritionData.dailyGoals.water * 0.7
    );
}

function updateGoalStatus(goalType, achieved, close) {
    const goalEl = document.querySelector(`.goal-item:has(.goal-name:contains('${goalType}')) .goal-status`);
    if (goalEl) {
        goalEl.className = 'goal-status ' + (achieved ? 'on-track' : close ? 'warning' : 'needs-work');
        goalEl.textContent = achieved ? 'On Track' : close ? 'Almost There' : 'Need More';
    }
}

// Meal Logging
function openMealLogger() {
    // TODO: Implement meal logging modal
    alert('Meal logging feature coming soon!');
}

function addMeal(meal) {
    nutritionData.meals.push({
        ...meal,
        timestamp: new Date().toISOString()
    });
    saveNutritionData();
    updateUI();
}

// Water Tracking
function addWater() {
    nutritionData.waterIntake += 250; // Add one glass (250ml)
    saveNutritionData();
    updateUI();
}

// Quick Add Foods
function quickAddFood(foodItem) {
    const commonFoods = {
        banana: { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.3 },
        apple: { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
        // Add more common foods as needed
    };

    if (commonFoods[foodItem]) {
        addMeal({
            name: commonFoods[foodItem].name,
            ...commonFoods[foodItem]
        });
    }
}

// Utility Functions
function calculateTotalCalories() {
    return nutritionData.meals.reduce((total, meal) => total + meal.calories, 0);
}

function calculateTotalMacros() {
    return nutritionData.meals.reduce((totals, meal) => ({
        protein: totals.protein + (meal.protein || 0),
        carbs: totals.carbs + (meal.carbs || 0),
        fats: totals.fats + (meal.fats || 0)
    }), { protein: 0, carbs: 0, fats: 0 });
}

function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function saveNutritionData() {
    localStorage.setItem('nutritionData', JSON.stringify({
        ...nutritionData,
        date: new Date().toISOString()
    }));
}

// Export for use in other modules
export {
    nutritionData,
    addMeal,
    addWater,
    quickAddFood
};
