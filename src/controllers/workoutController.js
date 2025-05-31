const db = require('../db');

// 1. GET /api/exercises
exports.getExercises = async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM exercises');
        res.json(results);
    } catch (err) {
        res.status(500).send('Error fetching exercises');
    }
};

// 2. GET /api/plans (prebuilt + user's custom)
exports.getAllPlans = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const results = await db.query(
            'SELECT * FROM plans WHERE created_by IS NULL OR created_by = ?',
            [userId]
        );
        res.json(results);
    } catch (err) {
        res.status(500).send('Error fetching plans');
    }
};

// 3. GET /api/user/plan (get current selected plan)
exports.getUserPlan = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const query = `
            SELECT plans.* FROM user_plan
            JOIN plans ON user_plan.plan_id = plans.id
            WHERE user_plan.user_id = ? LIMIT 1
        `;
        const results = await db.query(query, [userId]);
        if (results.length === 0) return res.status(404).send('No plan selected');
        res.json(results[0]);
    } catch (err) {
        res.status(500).send('Error fetching current plan');
    }
};

// 4. POST /api/user/plan (select a plan)
exports.setUserPlan = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { plan_id } = req.body;

        const sql = `
            INSERT INTO user_plan (user_id, plan_id, start_date)
            VALUES (?, ?, CURDATE())
            ON DUPLICATE KEY UPDATE plan_id = VALUES(plan_id), start_date = CURDATE()
        `;
        await db.query(sql, [userId, plan_id]);
        res.send('Plan updated');
    } catch (err) {
        res.status(500).send('Error setting plan');
    }
};

// 5. POST /api/plans (create custom plan)
exports.createCustomPlan = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { name, description, exercises } = req.body;

        // Step 1: insert plan with name + description
        const planResult = await db.query(
            'INSERT INTO plans (name, description, created_by) VALUES (?, ?, ?)',
            [name, description || null, userId]
        );
        const planId = planResult.insertId;

        // Step 2: insert exercises as workout_history rows with NULL date
        const entries = exercises.map(ex =>
            [userId, ex.exercise_id, planId, null, ex.sets, ex.reps, ex.weight, '']
        );

        const insertSQL = `
            INSERT INTO workout_history 
            (user_id, exercise_id, plan_id, occurred_on, sets, reps, weight, notes)
            VALUES ?
        `;

        await db.query(insertSQL, [entries]);
        res.send('Custom plan created');
    } catch (err) {
        res.status(500).send('Error saving exercises');
    }
};

// 6. GET /api/workout/history (completed workouts only)
exports.getWorkoutHistory = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const query = `
            SELECT wh.occurred_on, ex.name AS exercise, wh.sets, wh.reps, wh.weight
            FROM workout_history wh
            JOIN exercises ex ON wh.exercise_id = ex.id
            WHERE wh.user_id = ? AND wh.occurred_on IS NOT NULL
            ORDER BY wh.occurred_on DESC
        `;
        const results = await db.query(query, [userId]);
        res.json(results);
    } catch (err) {
        res.status(500).send('Error fetching history');
    }
};

// 7. POST /api/workout/log (record a workout from the user's plan)
exports.logWorkout = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { exercise_id, sets, reps, weight, notes } = req.body;

        await db.query(
            `INSERT INTO workout_history 
             (user_id, exercise_id, plan_id, occurred_on, sets, reps, weight, notes)
             VALUES (?, ?, NULL, CURDATE(), ?, ?, ?, ?)`,
            [userId, exercise_id, sets, reps, weight, notes || '']
        );
        res.send('Workout logged');
    } catch (err) {
        res.status(500).send('Failed to log workout');
    }
};

// 8. GET /api/plans/:id/details
exports.getPlanDetails = async (req, res) => {
    try {
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
        const results = await db.query(sql, [planId, today]);
        res.json({ exercises: results });
    } catch (err) {
        res.status(500).send('Error fetching plan details');
    }
};

// 9. DELETE /api/plans/:id
exports.deletePlan = async (req, res) => {
    try {
        const planId = req.params.id;
        await db.query('DELETE FROM workout_history WHERE plan_id = ?', [planId]);
        await db.query('DELETE FROM plans WHERE id = ?', [planId]);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).send('Error deleting plan');
    }
};
