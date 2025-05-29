const db = require('../db');

// 1. GET /api/exercises
exports.getExercises = (req, res) => {
  db.query('SELECT * FROM exercises', (err, results) => {
    if (err) return res.status(500).send('Error fetching exercises');
    res.json(results);
  });
};

// 2. GET /api/plans (prebuilt + user’s custom)
exports.getAllPlans = (req, res) => {
  const userId = req.session.user.id;
  db.query(
    'SELECT * FROM plans WHERE created_by IS NULL OR created_by = ?',
    [userId],
    (err, results) => {
      if (err) return res.status(500).send('Error fetching plans');
      res.json(results);
    }
  );
};

// 3. GET /api/user/plan (get current selected plan)
exports.getUserPlan = (req, res) => {
  const userId = req.session.user.id;
  const query = `
    SELECT plans.* FROM user_plan
    JOIN plans ON user_plan.plan_id = plans.id
    WHERE user_plan.user_id = ? LIMIT 1
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).send('Error fetching current plan');
    if (results.length === 0) return res.status(404).send('No plan selected');
    res.json(results[0]);
  });
};

// 4. POST /api/user/plan (select a plan)
exports.setUserPlan = (req, res) => {
  const userId = req.session.user.id;
  const { plan_id } = req.body;

  const sql = `
    INSERT INTO user_plan (user_id, plan_id, start_date)
    VALUES (?, ?, CURDATE())
    ON DUPLICATE KEY UPDATE plan_id = VALUES(plan_id), start_date = CURDATE()
  `;
  db.query(sql, [userId, plan_id], (err) => {
    if (err) return res.status(500).send('Error setting plan');
    res.send('Plan updated');
  });
};

// 5. POST /api/plans (create custom plan)
exports.createCustomPlan = (req, res) => {
  const userId = req.session.user.id;
  const { name, description, exercises } = req.body;

  // Step 1: insert plan with name + description
  db.query(
    'INSERT INTO plans (name, description, created_by) VALUES (?, ?, ?)',
    [name, description || null, userId],
    (err, result) => {
      if (err) return res.status(500).send('Error saving plan');

      const planId = result.insertId;

      // Step 2: insert exercises as workout_history rows with NULL date
      const entries = exercises.map(ex =>
        [userId, ex.exercise_id, planId, null, ex.sets, ex.reps, ex.weight, '']
      );

      const insertSQL = `
        INSERT INTO workout_history 
        (user_id, exercise_id, plan_id, occurred_on, sets, reps, weight, notes)
        VALUES ?
      `;

      db.query(insertSQL, [entries], (err2) => {
        if (err2) return res.status(500).send('Error saving exercises');
        res.send('Custom plan created');
      });
    }
  );
};


// 6. GET /api/workout/history (completed workouts only)
exports.getWorkoutHistory = (req, res) => {
  const userId = req.session.user.id;
  const query = `
    SELECT wh.occurred_on, ex.name AS exercise, wh.sets, wh.reps, wh.weight
    FROM workout_history wh
    JOIN exercises ex ON wh.exercise_id = ex.id
    WHERE wh.user_id = ? AND wh.occurred_on IS NOT NULL
    ORDER BY wh.occurred_on DESC
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).send('Error fetching history');
    res.json(results);
  });
};

// 7. POST /api/workout/log (record a workout from the user’s plan)
exports.logWorkout = (req, res) => {
  const userId = req.session.user.id;
  const { exercise_id, sets, reps, weight, notes } = req.body;

  db.query(
    `INSERT INTO workout_history 
     (user_id, exercise_id, plan_id, occurred_on, sets, reps, weight, notes)
     VALUES (?, ?, NULL, CURDATE(), ?, ?, ?, ?)`,
    [userId, exercise_id, sets, reps, weight, notes || ''],
    (err) => {
      if (err) return res.status(500).send('Failed to log workout');
      res.send('Workout logged');
    }
  );
};


// 8. GET /api/plans/:id/details
exports.getPlanDetails = (req, res) => {
  const planId = req.params.id;
  // Determine today's weekday in JS and pass to SQL
  const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = weekdays[new Date().getDay()];

  const sql = `
    SELECT pe.exercise_id, ex.name, pe.display_order
    FROM plan_exercises pe
    JOIN exercises ex ON pe.exercise_id = ex.id
    WHERE pe.plan_id = ? AND pe.day_of_week = ?
    ORDER BY pe.display_order
  `;
  db.query(sql, [planId, today], (err, results) => {
    if (err) return res.status(500).send('Error fetching today’s plan details');
    res.json({ exercises: results });
  });
};

// 9. DELETE /api/plans/:id
exports.deletePlan = (req, res) => {
  const planId = req.params.id;
  db.query('DELETE FROM workout_history WHERE plan_id = ?', [planId], (err1) => {
    if (err1) return res.status(500).send('Error cleaning plan data');
    db.query('DELETE FROM plans WHERE id = ?', [planId], (err2) => {
      if (err2) return res.status(500).send('Error deleting plan');
      res.sendStatus(204);
    });
  });
};
