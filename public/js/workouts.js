// File: public/js/workouts.js
document.addEventListener('DOMContentLoaded', async () => {
  /* Element refs */
  const usernameEls    = document.querySelectorAll('.username');
  const noPlanMsg      = document.getElementById('no-plan-msg');
  const planDetails    = document.getElementById('plan-details');
  const planGrid       = document.getElementById('plan-grid');
  const customForm     = document.getElementById('customPlanForm');
  const exerciseList   = document.getElementById('exercise-list');
  const addExerciseBtn = document.getElementById('addExerciseBtn');
  const followSection  = document.getElementById('follow-along');
  const followStep     = document.getElementById('follow-step');
  const addSetBtn      = document.getElementById('addSetBtn');
  const completeBtn    = document.getElementById('completeStepBtn');
  const finishBtn      = document.getElementById('finishPlanBtn');
  const historyCards   = document.querySelector('.history-cards');
  const startBtn       = document.getElementById('startWorkoutBtn');

  // auth
  let user;
  try {
    const r = await fetch('/api/user');
    user = await r.json();
    usernameEls.forEach(el => el.textContent = user.username);
  } catch { return window.location = '/login.html'; }

  const fetchJSON = (url, opts) => fetch(url, opts).then(r=>r.ok?r.json():[]);

  // load current plan
  async function loadPlan() {
    const r = await fetch('/api/user/plan');
    if (!r.ok) return;
    const plan = await r.json();
    noPlanMsg.classList.add('hidden');
    planDetails.classList.remove('hidden');
    planDetails.innerHTML = `<h3>${plan.name}</h3>${plan.description?`<p>${plan.description}</p>`:''}`;
  }

  // load plans
  async function loadPlans() {
    const plans = await fetchJSON('/api/plans');
    planGrid.innerHTML = '';
    for (let p of plans) {
      const div = document.createElement('div');
      div.className = 'plan-card';
      div.innerHTML = `
        <h3>${p.name}</h3>${p.description?`<p>${p.description}</p>`:''}
        <button class="btn-primary">Select</button>
        ${p.created_by===user.id?'<button class="btn-outline delete-plan">Delete</button>':''}
      `;
      div.querySelector('button.btn-primary').onclick = async ()=>{
        await fetch('/api/user/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan_id:p.id})});
        await loadPlan();
      };
      const del = div.querySelector('.delete-plan');
      if (del) del.onclick = async ()=>{
        if (!confirm('Delete plan?')) return;
        await fetch(`/api/plans/${p.id}`,{method:'DELETE'});
        await loadPlans(); await loadPlan();
      };
      planGrid.append(div);
    }
  }

  // custom form
  const allX = await fetchJSON('/api/exercises');
  function addRow() {
    const row = document.createElement('div');
    row.className = 'exercise-row';
    row.innerHTML = `
      <select name="exercise_id">${allX.map(e=>`<option value="${e.id}">${e.name}</option>`).join('')}</select>
      <input type="number" name="sets"   placeholder="Sets"   min="1" required>
      <input type="number" name="reps"   placeholder="Reps"   min="1" required>
      <input type="number" name="weight" placeholder="Weight" min="0" required>`;
    exerciseList.append(row);
  }
  addExerciseBtn.onclick = addRow;
  customForm.onsubmit = async e=>{
    e.preventDefault();
    const name = document.getElementById('planName').value;
    const desc = document.getElementById('planDescription').value;
    const rows = [...exerciseList.querySelectorAll('.exercise-row')];
    const exs  = rows.map(r=>({
      exercise_id:+r.querySelector('select').value,
      sets:+r.querySelector('[name=sets]').value,
      reps:+r.querySelector('[name=reps]').value,
      weight:+r.querySelector('[name=weight]').value
    }));
    await fetch('/api/plans',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,description:desc,exercises:exs})});
    customForm.reset(); exerciseList.innerHTML=''; addRow(); await loadPlans();
  };

  // workout history → cards
  // 5️⃣ WORKOUT HISTORY – grouped, collapsible
async function loadHistory() {
  const hist = await fetchJSON('/api/workout/history');
  // Group by date → then by exercise
  const byDate = {};
  hist.forEach(row => {
    if (!byDate[row.occurred_on]) byDate[row.occurred_on] = {};
    const day = byDate[row.occurred_on];
    if (!day[row.exercise]) day[row.exercise] = [];
    day[row.exercise].push({ sets: row.sets, reps: row.reps, weight: row.weight });
  });

  const container = document.getElementById('history-list');
  container.innerHTML = '';

  for (const [date, exercises] of Object.entries(byDate)) {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.innerHTML = `
      <header>
        <span>${date}</span>
        <button class="toggle-btn">▶</button>
      </header>
      <div class="details">
        ${Object.entries(exercises).map(([exName, setsArr]) => `
          <div class="exercise-card">
            <h4>${exName}</h4>
            <ul class="set-list">
              ${setsArr.map(s => `<li>${s.sets}×${s.reps} @ ${s.weight ?? 0}kg</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
    // Toggle expand/collapse
    const hdr = card.querySelector('header');
    const btn = card.querySelector('.toggle-btn');
    hdr.onclick = () => {
      const expanded = card.classList.toggle('expanded');
      btn.textContent = expanded ? '▼' : '▶';
    };
    container.append(card);
  }
}
  // follow-along
  let planList=[], idx=0;
  async function loadFollow() {
    const pl = await fetchJSON('/api/user/plan');
    if (!pl.id) return alert('Select a plan first');
    const details = await fetchJSON(`/api/plans/${pl.id}/details`);
    planList = details.exercises;
    idx = 0;
    if (!planList.length) return alert('No exercises today.');
    followSection.classList.remove('hidden');
    showStep();
  }
  function showStep() {
    if (idx>=planList.length) {
      followSection.classList.add('hidden');
      return loadHistory();
    }
    const ex = planList[idx];
    followStep.innerHTML = `
      <h3>${ex.name}</h3>
      <div class="form-row">
        <label>Sets:<input id="setsInput" type="number" min="1" value="${ex.sets||1}"></label>
        <label>Reps:<input id="repsInput" type="number" min="1" value="${ex.reps||1}"></label>
        <label>Weight:<input id="weightInput" type="number" min="0" value="0"></label>
      </div>`;
  }
  completeBtn.onclick = async () => {
    const si = document.getElementById('setsInput'),
          ri = document.getElementById('repsInput'),
          wi = document.getElementById('weightInput');
    if (!si||!ri||!wi) return alert('Inputs missing');
    const ex = planList[idx];
    await fetch('/api/workout/log',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        exercise_id: ex.exercise_id,
        sets:+si.value,
        reps:+ri.value,
        weight:+wi.value
      })
    });
    idx++; showStep();
  };
  finishBtn.onclick = ()=> followSection.classList.add('hidden');
  addSetBtn.onclick = ()=> {
    const row = document.createElement('div');
    row.className = 'set-row form-row';
    row.innerHTML = `
      <input type="number" placeholder="Sets" min="1">
      <input type="number" placeholder="Reps" min="1">
      <input type="number" placeholder="Weight" min="0">`;
    followStep.append(row);
  };

  /* INIT */
  await loadPlan();
  await loadPlans();
  await loadHistory();
  addRow();
  startBtn.onclick = loadFollow;
});
