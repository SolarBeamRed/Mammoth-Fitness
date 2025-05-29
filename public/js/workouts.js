document.addEventListener('DOMContentLoaded', async () => {
  const usernameEls = document.querySelectorAll('.username');
  const noPlanMsg = document.getElementById('no-plan-msg');
  const planDetails = document.getElementById('plan-details');
  const planGrid = document.getElementById('plan-grid');
  const customForm = document.getElementById('customPlanForm');
  const exerciseList = document.getElementById('exercise-list');
  const addExerciseBtn = document.getElementById('addExerciseBtn');
  const followSection = document.getElementById('follow-along');
  const followStep = document.getElementById('follow-step');
  const completeStepBtn = document.getElementById('completeStepBtn');
  const finishPlanBtn = document.getElementById('finishPlanBtn');
  const historyBody = document.getElementById('history-body');

  // 1. Authenticate and set username
  let user;
  try {
    const res = await fetch('/api/user'); user = await res.json();
    usernameEls.forEach(el => el.textContent = user.username);
  } catch {
    return window.location.href = '/login.html';
  }

  // Helpers
  const fetchJSON = (url, opts) => fetch(url, opts).then(r => r.ok ? r.json() : []);

  // 2. Load current plan
  const loadUserPlan = async () => {
    const res = await fetch('/api/user/plan');
    if (!res.ok) return;
    const plan = await res.json();
    noPlanMsg.classList.add('hidden');
    planDetails.classList.remove('hidden');
    planDetails.innerHTML = `<h3>${plan.name}</h3>${plan.description ? `<p>${plan.description}</p>` : ''}`;
  };

  // 3. Load all plans
  const loadPlans = async () => {
    const plans = await fetchJSON('/api/plans');
    planGrid.innerHTML = '';
    plans.forEach(p => {
      const card = document.createElement('div'); card.className='plan-card';
      card.innerHTML = `<h3>${p.name}</h3>${p.description?`<p>${p.description}</p>`:''}` +
        `<button class='btn-primary' data-id='${p.id}'>Select</button>` +
        `${p.created_by===user.id?`<button class='btn-outline delete-plan' data-id='${p.id}'>Delete</button>`:''}`;
      // select
      card.querySelector('.btn-primary').onclick = async () => { await fetch('/api/user/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan_id:p.id})}); loadUserPlan(); };      // delete
      if (p.created_by===user.id) {
        card.querySelector('.delete-plan').onclick = async () => {
          if (!confirm('Are you sure you want to delete this workout plan? This action cannot be undone.')) {
            return;
          }
          
          try {
            const response = await fetch(`/api/plans/${p.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText || 'Failed to delete plan');
            }
            
            // Show success message
            const notification = document.createElement('div');
            notification.className = 'notification success';
            notification.textContent = 'Plan deleted successfully';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
            
            // Reload plans and current plan (in case the deleted plan was selected)
            await loadPlans();
            await loadUserPlan();
            
          } catch (error) {
            console.error('Delete failed:', error);
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.textContent = error.message || 'Failed to delete plan';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
          }
        };
      }
      planGrid.appendChild(card);
    });
  };

  // 4. Custom plan form
  let exercises=[];
  const allExercises = await fetchJSON('/api/exercises');
  const addRow = () => {
    const row = document.createElement('div'); row.className='exercise-row';
    row.innerHTML = `<select name='exercise_id'>${allExercises.map(e=>`<option value='${e.id}'>${e.name}</option>`).join('')}</select>
      <input type='number' name='sets' placeholder='Sets' min=1 required>
      <input type='number' name='reps' placeholder='Reps' min=1 required>
      <input type='number' name='weight' placeholder='Weight' min=0 required>`;
    exerciseList.appendChild(row);
  };
  addExerciseBtn.onclick = addRow;
  customForm.onsubmit = async e => {
    e.preventDefault();
    const name = document.getElementById('planName').value;
    const description = document.getElementById('planDescription').value;

    const rows = [...exerciseList.querySelectorAll('.exercise-row')];
    const exs=rows.map(r=>({exercise_id:+r.querySelector('select').value,sets:+r.querySelector('[name=sets]').value,reps:+r.querySelector('[name=reps]').value,weight:+r.querySelector('[name=weight]').value}));
    await fetch('/api/plans',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name, description, exercises:exs})});
    customForm.reset(); exerciseList.innerHTML=''; loadPlans();
  };

  // 5. Workout history
  const loadHistory = async () => {
    const hist = await fetchJSON('/api/workout/history'); historyBody.innerHTML='';
    hist.forEach(h=>historyBody.innerHTML+=`<tr><td>${h.occurred_on}</td><td>${h.exercise}</td><td>${h.sets}</td><td>${h.reps}</td><td>${h.weight}</td></tr>`);
  };

  // 6. Follow-along feature (basic)
  let followPlan = null, followIdx=0;
  const loadFollow = async () => {
    const plan = await fetchJSON('/api/user/plan'); 
    if(!plan) return;
    
    // Use the correct endpoint
    const details = await fetchJSON(`/api/plans/${plan.id}/details`);
    
    followPlan = details.exercises; 
    followIdx = 0;
    showStep(); 
    followSection.classList.remove('hidden');
  };
  const showStep = () => {
    if(followIdx>=followPlan.length){ followSection.classList.add('hidden'); return; }
    const c = followPlan[followIdx];
    followStep.innerHTML = `<h3>${c.name}</h3><p>Sets: ${c.sets}, Reps: ${c.reps}</p>`;
  };
  completeStepBtn.onclick = async () => {
    const c = followPlan[followIdx];
    await fetch('/api/workout/log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({exercise_id:c.exercise_id,sets:c.sets,reps:c.reps,weight:null})});
    followIdx++; showStep(); loadHistory();
  };
  finishPlanBtn.onclick = () => { followSection.classList.add('hidden'); };

  // Initialize
  await loadUserPlan(); await loadPlans(); await loadHistory(); addRow(); await loadFollow();
});
