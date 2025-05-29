// File: public/js/nutrition.js
document.addEventListener('DOMContentLoaded', async () => {
    // 1) Ensure logged in and load user info
    const me = await fetch('/api/user');
    if (!me.ok) return window.location = '/login.html';
    
    const user = await me.json();
    document.querySelectorAll('.username').forEach(el => {
        el.textContent = user.username;
    });

    let currentGoals = {};
    let todayStats = {};
    
    // UI Elements
    const calorieMeter = document.getElementById('calorie-meter');
    const macroSummary = document.getElementById('macro-summary');
    const mealsContainer = document.getElementById('meals-container');
    const waterStats = document.getElementById('water-stats');
    const waterTracker = document.getElementById('water-tracker');
    const logMealBtn = document.getElementById('logMealBtn');
    const addWaterBtn = document.getElementById('addWaterBtn');
    const goalsList = document.getElementById('goals-list');
    const setGoalsBtn = document.getElementById('setGoalsBtn');

    // Modal Elements
    const addMealModal = document.getElementById('addMealModal');
    const setGoalsModal = document.getElementById('setGoalsModal');
    const addMealForm = document.getElementById('addMealForm');
    const goalsForm = document.getElementById('goalsForm');
    const addFoodItemBtn = document.getElementById('addFoodItemBtn');
    const foodItemsList = document.getElementById('foodItemsList');
    const foodItemTemplate = document.getElementById('foodItemTemplate');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    // Helper for API calls
    const fetchJSON = async (url, opts = {}) => {
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error('API request failed');
        return res.json();
    };

    // Load nutrition summary
    async function loadSummary() {
        const data = await fetchJSON('/api/nutrition/summary');
        todayStats = data;
        
        // Update calorie meter - cap at 100% and set colors based on progress
        const caloriePercentage = Math.min((data.consumed.calories / data.goals.calorie_target) * 100, 100);
        const calorieStatus = caloriePercentage >= 100 ? 'warning' : (caloriePercentage >= 90 ? 'on-track' : '');
        calorieMeter.innerHTML = `
            <div class="meter-circle ${calorieStatus}" style="--progress: ${caloriePercentage}%">
                <div class="meter-content">
                    <strong>${data.consumed.calories}</strong>
                    <span>/${data.goals.calorie_target}</span>
                    <small>calories</small>
                </div>
            </div>
        `;
        
        // Update macros with improved display and progress bars
        macroSummary.innerHTML = `
            <div class="macro">
                <div class="macro-header">
                    <label>Protein (${data.consumed.protein}g/${data.goals.protein_target}g)</label>
                </div>
                <div class="macro-bar-container">
                    <div class="macro-bar ${data.consumed.protein >= data.goals.protein_target ? 'goal-reached' : ''}" 
                         style="width: ${Math.min((data.consumed.protein / data.goals.protein_target) * 100, 100)}%">
                    </div>
                </div>
            </div>
            <div class="macro">
                <div class="macro-header">
                    <label>Carbs (${data.consumed.carbs}g/${data.goals.carb_target}g)</label>
                </div>
                <div class="macro-bar-container">
                    <div class="macro-bar ${data.consumed.carbs >= data.goals.carb_target ? 'goal-reached' : ''}"
                         style="width: ${Math.min((data.consumed.carbs / data.goals.carb_target) * 100, 100)}%">
                    </div>
                </div>
            </div>
            <div class="macro">
                <div class="macro-header">
                    <label>Fats (${data.consumed.fats}g/${data.goals.fat_target}g)</label>
                </div>
                <div class="macro-bar-container">
                    <div class="macro-bar ${data.consumed.fats >= data.goals.fat_target ? 'goal-reached' : ''}"
                         style="width: ${Math.min((data.consumed.fats / data.goals.fat_target) * 100, 100)}%">
                    </div>
                </div>
            </div>
        `;

        updateGoalsList(data);
    }

    // Load today's meals
    async function loadMeals() {
        const meals = await fetchJSON('/api/nutrition/meals/today');
        mealsContainer.innerHTML = '';
        
        for (const meal of meals) {
            const items = await fetchJSON(`/api/nutrition/meals/${meal.id}/items`);
            const totalCals = items.reduce((sum, item) => sum + item.calories, 0);
            
            const mealEl = document.createElement('div');
            mealEl.className = `meal-card ${meal.name.toLowerCase()}`;
            mealEl.innerHTML = `
                <div class="meal-header">
                    <h3><i class="fas fa-utensils"></i> ${meal.name}</h3>
                    <span class="meal-time">${formatTime(meal.time)}</span>
                </div>
                <div class="meal-items">
                    ${items.map(item => `
                        <div class="meal-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-macros">
                                ${item.calories}cal • ${item.protein}p • ${item.carbs}c • ${item.fats}f
                            </span>
                        </div>
                    `).join('')}
                </div>
                <div class="meal-total">
                    <span>Total</span>
                    <span>${totalCals} calories</span>
                </div>
            `;
            mealsContainer.appendChild(mealEl);
        }

        if (meals.length === 0) {
            mealsContainer.innerHTML = `
                <div class="no-meals">
                    <p>No meals logged today</p>
                    <small>Click "Log Meal" to get started</small>
                </div>
            `;
        }
    }    // Update water tracker
    async function loadWater() {
        const data = await fetchJSON('/api/nutrition/water/today');
        const waterPercentage = Math.min((data.glasses / currentGoals.water_target) * 100, 100);
        const waterStatus = waterPercentage >= 100 ? 'goal-reached' : '';
        
        waterStats.textContent = `${data.glasses}/${currentGoals.water_target} glasses`;
        updateWaterUI(data.glasses, currentGoals.water_target, waterPercentage, waterStatus);
    }

    function updateWaterUI(glasses, target, percentage, status) {
        waterTracker.innerHTML = `
            <div class="meter-circle ${status}" style="--progress: ${percentage}%">
                <div class="meter-content">
                    <strong>${glasses}</strong>
                    <span>/${target}</span>
                    <small>glasses</small>
                </div>
            </div>`;
    }

    function updateGoalsList(data) {
        const { consumed, goals } = data;
        
        const calculateStatus = (current, target) => {
            const percent = (current / target) * 100;
            if (percent >= 90 && percent <= 110) return 'on-track';
            if (percent < 90) return 'needs-work';
            return 'warning';
        };

        goalsList.innerHTML = `
            <li class="goal-item">
                <span>Calories</span>
                <span class="goal-status ${calculateStatus(consumed.calories, goals.calorie_target)}">
                    ${Math.round((consumed.calories / goals.calorie_target) * 100)}%
                </span>
            </li>
            <li class="goal-item">
                <span>Protein</span>
                <span class="goal-status ${calculateStatus(consumed.protein, goals.protein_target)}">
                    ${Math.round((consumed.protein / goals.protein_target) * 100)}%
                </span>
            </li>
            <li class="goal-item">
                <span>Carbs</span>
                <span class="goal-status ${calculateStatus(consumed.carbs, goals.carb_target)}">
                    ${Math.round((consumed.carbs / goals.carb_target) * 100)}%
                </span>
            </li>
            <li class="goal-item">
                <span>Fats</span>
                <span class="goal-status ${calculateStatus(consumed.fats, goals.fat_target)}">
                    ${Math.round((consumed.fats / goals.fat_target) * 100)}%
                </span>
            </li>
            <li class="goal-item">
                <span>Water</span>
                <span class="goal-status ${calculateStatus(data.water, goals.water_target)}">
                    ${Math.round((data.water / goals.water_target) * 100)}%
                </span>
            </li>
        `;
    }

    // Load current goals
    async function loadGoals() {
        try {
            const goals = await fetchJSON('/api/nutrition/goals');
            currentGoals = goals;
            return goals;
        } catch (error) {
            console.error('Failed to load goals:', error);
            return {};
        }
    }

    // Modal Functions
    function openModal(modal) {
        modal.classList.add('active');
    }

    function closeModal(modal) {
        modal.classList.remove('active');
    }

    function openGoalsModal() {
        goalsForm.reset();
        
        // Pre-fill current goals if they exist
        if (currentGoals) {
            const inputs = goalsForm.elements;
            inputs.calories.value = currentGoals.calorie_target || '';
            inputs.protein.value = currentGoals.protein_target || '';
            inputs.carbs.value = currentGoals.carb_target || '';
            inputs.fats.value = currentGoals.fat_target || '';
            inputs.water.value = currentGoals.water_target || '';
        }
        
        openModal(setGoalsModal);
    }

    // Event Handlers
    setGoalsBtn.addEventListener('click', openGoalsModal);

    goalsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const goals = {
                calorie_target: parseInt(formData.get('calories')),
                protein_target: parseInt(formData.get('protein')),
                carb_target: parseInt(formData.get('carbs')),
                fat_target: parseInt(formData.get('fats')),
                water_target: parseInt(formData.get('water'))
            };

            await fetchJSON('/api/nutrition/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(goals)
            });

            closeModal(setGoalsModal);
            currentGoals = goals;
            await loadSummary();
        } catch (error) {
            alert('Error setting goals: ' + error.message);
        }
    });

    // Add a new food item to the form
    function addFoodItem() {
        const newItem = document.importNode(foodItemTemplate.content, true);
        const removeBtn = newItem.querySelector('.remove-item');
        
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const foodItem = e.target.closest('.food-item');
            if (foodItemsList.children.length > 1) {
                foodItem.remove();
            }
        });

        foodItemsList.appendChild(newItem);
    }

    // Update the openModal and closeModal handlers for meal modal
    function openMealModal() {
        addMealForm.reset();
        foodItemsList.innerHTML = '';
        addFoodItem();
        openModal(addMealModal);
    }

    function closeMealModal() {
        closeModal(addMealModal);
    }

    // Event Handlers
    logMealBtn.addEventListener('click', openMealModal);
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    addFoodItemBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addFoodItem();
    });

    addMealForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const time = new Date().toTimeString().slice(0, 8);
            
            // Create the meal
            const { mealId } = await fetchJSON('/api/nutrition/meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: formData.get('mealType'),
                    time 
                })
            });

            // Add each food item
            const foodItems = document.querySelectorAll('.food-item');
            for (const item of foodItems) {
                const itemInputs = item.querySelectorAll('input');
                const foodData = {
                    name: itemInputs[0].value,
                    calories: parseInt(itemInputs[1].value) || 0,
                    protein: parseInt(itemInputs[2].value) || 0,
                    carbs: parseInt(itemInputs[3].value) || 0,
                    fats: parseInt(itemInputs[4].value) || 0
                };

                await fetchJSON(`/api/nutrition/meals/${mealId}/items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(foodData)
                });
            }

            closeMealModal();
            await loadSummary();
            await loadMeals();
        } catch (error) {
            alert('Error adding meal: ' + error.message);
        }
    });

    addWaterBtn.addEventListener('click', async () => {
        try {
            await fetchJSON('/api/nutrition/water/add', { method: 'POST' });
            await loadSummary();
            await loadWater();
        } catch (error) {
            alert('Error adding water: ' + error.message);
        }
    });

    // Helpers
    function formatTime(time) {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Initialize
    try {
        await loadGoals();
        await loadSummary();
        await loadMeals();
        await loadWater();
    } catch (error) {
        console.error('Failed to load nutrition data:', error);
        alert('Failed to load nutrition data. Please try refreshing the page.');
    }
});
