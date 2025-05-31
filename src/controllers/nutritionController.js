// File: src/controllers/nutritionController.js
const db = require('../db');

function today() {
  return new Date().toISOString().slice(0,10);
}

exports.getSummary = async (req, res) => {
  try {
    const uid = req.session.user.id;
    const dt  = today();

    // 1) meal items sum
    const consumedRows = await db.query(
      `SELECT 
         COALESCE(SUM(mi.calories),0) AS calories,
         COALESCE(SUM(mi.protein),0)  AS protein,
         COALESCE(SUM(mi.carbs),0)    AS carbs,
         COALESCE(SUM(mi.fats),0)     AS fats
       FROM meals m
       JOIN meal_items mi ON mi.meal_id = m.id
       WHERE m.user_id = ? AND m.date = ?`,
      [uid, dt]
    );
    const consumed = consumedRows[0] || { calories: 0, protein: 0, carbs: 0, fats: 0 };

    // 2) goals
    const goalsRows = await db.query(
      'SELECT * FROM nutrition_goals WHERE user_id = ?',
      [uid]
    );
    const goals = goalsRows[0] || {
      calorie_target: 2000, protein_target: 150, carb_target: 250, fat_target: 65, water_target: 8
    };

    // 3) water
    const waterRows = await db.query(
      'SELECT glasses FROM water_log WHERE user_id = ? AND date = ?',
      [uid, dt]
    );
    const water = (waterRows[0] && waterRows[0].glasses) || 0;

    // final response
    res.json({ consumed, goals, water });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMealsToday = async (req, res) => {
    try {
        const uid = req.session.user.id;
        const dt = today();
        const rows = await db.query(
            `SELECT id,name,time 
             FROM meals 
             WHERE user_id = ? AND date = ? 
             ORDER BY time`,
            [uid, dt]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.getMealItems = async (req, res) => {
    try {
        const mealId = req.params.mealId;
        const rows = await db.query(
            `SELECT name, calories, protein, carbs, fats 
             FROM meal_items 
             WHERE meal_id = ?`,
            [mealId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.createMeal = async (req, res) => {
    try {
        const uid = req.session.user.id;
        const dt = today();
        const { name, time } = req.body;
        const result = await db.query(
            'INSERT INTO meals (user_id,name,time,date) VALUES (?,?,?,?)',
            [uid, name, time, dt]
        );
        res.json({ mealId: result.insertId });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.addMealItem = async (req, res) => {
    try {
        const mealId = req.params.mealId;
        const { name, calories, protein, carbs, fats } = req.body;
        await db.query(
            `INSERT INTO meal_items 
             (meal_id,name,calories,protein,carbs,fats)
             VALUES (?,?,?,?,?,?)`,
            [mealId, name, calories, protein, carbs, fats]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.getWaterToday = async (req, res) => {
    try {
        const uid = req.session.user.id;
        const dt = today();
        const rows = await db.query(
            'SELECT glasses FROM water_log WHERE user_id=? AND date=?',
            [uid, dt]
        );
        res.json({ glasses: (rows[0] && rows[0].glasses) || 0 });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.addWater = async (req, res) => {
    try {
        const uid = req.session.user.id;
        const dt = today();
        await db.query(
            `INSERT INTO water_log (user_id,date,glasses)
             VALUES (?,?,1)
             ON DUPLICATE KEY UPDATE glasses=glasses+1`,
            [uid, dt]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.getGoals = async (req, res) => {
    try {
        const uid = req.session.user.id;
        const rows = await db.query(
            'SELECT * FROM nutrition_goals WHERE user_id=?',
            [uid]
        );
        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.setGoals = async (req, res) => {
    try {
        const uid = req.session.user.id;
        const { calorie_target, protein_target, carb_target, fat_target, water_target } = req.body;
        await db.query(
            `INSERT INTO nutrition_goals
             (user_id,calorie_target,protein_target,carb_target,fat_target,water_target)
             VALUES (?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
             calorie_target=VALUES(calorie_target),
             protein_target=VALUES(protein_target),
             carb_target=VALUES(carb_target),
             fat_target=VALUES(fat_target),
             water_target=VALUES(water_target)`,
            [uid, calorie_target, protein_target, carb_target, fat_target, water_target]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
};
