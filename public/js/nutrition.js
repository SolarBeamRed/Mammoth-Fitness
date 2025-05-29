// File: public/js/nutrition.js

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const usernameEls = document.querySelectorAll('.username');
  const caloriesConsumedEl = document.querySelector('.calories-consumed');
  const totalCaloriesEl = document.querySelector('.total-calories');
  const proteinBar = document.querySelector('.protein .macro-bar');
  const carbsBar = document.querySelector('.carbs .macro-bar');
  const fatsBar = document.querySelector('.fats .macro-bar');
  const proteinValue = document.querySelector('.protein .macro-value');
  const carbsValue = document.querySelector('.carbs .macro-value');
  const fatsValue = document.querySelector('.fats .macro-value');
  const mealsSection = document.querySelector('.meal-cards');
  const logMealBtn = document.querySelector('.log-meal-btn');
  const waterBars = document.querySelectorAll('.water-bar');
  const currentWaterEl = document.querySelector('.water-tracker .current');
  const targetWaterEl = document.querySelector('.water-tracker .target');
  const addWaterBtn = document.querySelector('.add-water-btn');

  // 1. Fetch user and personalize
  let user;
  try {
    const res = await fetch('/api/user');
    user = await res.json();
    usernameEls.forEach(el => el.textContent = user.username);
  } catch {
    window.location.href = '/login.html';
    return;
  }

  // 2. Fetch nutrition summary
  const summaryRes = await fetch('/api/nutrition/summary');
  if (summaryRes.ok) {
    const { consumed, goal, protein, proteinGoal, carbs, carbsGoal, fats, fatsGoal } = await summaryRes.json();
    caloriesConsumedEl.textContent = consumed;
    totalCaloriesEl.textContent = `/ ${goal}`;
    proteinBar.style.width = `${Math.min(100, (protein/proteinGoal)*100)}%`;
    carbsBar.style.width = `${Math.min(100, (carbs/carbsGoal)*100)}%`;
    fatsBar.style.width = `${Math.min(100, (fats/fatsGoal)*100)}%`;
    proteinValue.textContent = `${protein}g / ${proteinGoal}g`;
    carbsValue.textContent = `${carbs}g / ${carbsGoal}g`;
    fatsValue.textContent = `${fats}g / ${fatsGoal}g`;
  }

  // 3. Fetch today's meals
  const mealsRes = await fetch('/api/nutrition/meals');
  if (mealsRes.ok) {
    const meals = await mealsRes.json();
    mealsSection.innerHTML = meals.map(meal => `
      <div class="meal-card ${meal.type.toLowerCase()}">
        <div class="meal-header">
          <h3><i class="fas ${meal.icon}"></i>${meal.type}</h3>
          <span class="meal-time">${meal.time}</span>
        </div>
        <div class="meal-items">
          ${meal.items.map(item => `
            <div class="meal-item">
              <span class="item-name">${item.name}</span>
              <span class="item-calories">${item.calories} kcal</span>
            </div>
          `).join('')}
        </div>
        <div class="meal-total">
          <span>Total</span><span>${meal.total} kcal</span>
        </div>
      </div>
    `).join('');
  }

  // 4. Log meal modal placeholder
  logMealBtn.addEventListener('click', () => {
    alert('Meal logging UI to be implemented');
  });

  // 5. Water intake
  const waterRes = await fetch('/api/nutrition/water');
  if (waterRes.ok) {
    const { current, goal } = await waterRes.json();
    targetWaterEl.textContent = `/ ${goal}L`;
    currentWaterEl.textContent = `${current}L`;
    waterBars.forEach((bar, idx) => {
      if (idx < Math.floor((current/goal)*waterBars.length)) bar.classList.add('filled');
    });
  }
  addWaterBtn.addEventListener('click', async () => {
    const res = await fetch('/api/nutrition/water', { method: 'POST' });
    if (res.ok) window.location.reload();
  });
});
