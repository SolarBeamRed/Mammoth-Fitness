// File: src/controllers/nutritionController.js
const db = require('../db');

function today() {
  return new Date().toISOString().slice(0,10);
}

exports.getSummary = (req, res) => {
  const uid = req.session.user.id;
  const dt  = today();

  // 1) meal items sum
  db.query(
    `SELECT 
       COALESCE(SUM(mi.calories),0) AS calories,
       COALESCE(SUM(mi.protein),0)  AS protein,
       COALESCE(SUM(mi.carbs),0)    AS carbs,
       COALESCE(SUM(mi.fats),0)     AS fats
     FROM meals m
     JOIN meal_items mi ON mi.meal_id = m.id
     WHERE m.user_id = ? AND m.date = ?`,
    [uid, dt],
    (err, [row]) => {
      if (err) return res.status(500).json({ error: err.message });
      const consumed = row || { calories: 0, protein: 0, carbs: 0, fats: 0 };

      // 2) goals
      db.query(
        'SELECT * FROM nutrition_goals WHERE user_id = ?',
        [uid],
        (err2, goalsRows) => {
          if (err2) return res.status(500).json({ error: err2.message });
          const goals = goalsRows[0] || {
            calorie_target: 2000, protein_target: 150, carb_target: 250, fat_target: 65, water_target: 8
          };

          // 3) water
          db.query(
            'SELECT glasses FROM water_log WHERE user_id = ? AND date = ?',
            [uid, dt],
            (err3, waterRows) => {
              if (err3) return res.status(500).json({ error: err3.message });
              const water = (waterRows[0] && waterRows[0].glasses) || 0;

              // final response
              res.json({ consumed, goals, water });
            }
          );
        }
      );
    }
  );
};

exports.getMealsToday = (req, res) => {
  const uid = req.session.user.id, dt = today();
  db.query(
    `SELECT id,name,time 
     FROM meals 
     WHERE user_id = ? AND date = ? 
     ORDER BY time`,
    [uid, dt],
    (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json(rows);
    }
  );
};

exports.getMealItems = (req, res) => {
  const mealId = req.params.mealId;
  db.query(
    `SELECT name, calories, protein, carbs, fats 
     FROM meal_items 
     WHERE meal_id = ?`,
    [mealId],
    (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json(rows);
    }
  );
};

exports.createMeal = (req, res) => {
  const uid = req.session.user.id, dt = today();
  const { name, time } = req.body;
  db.query(
    'INSERT INTO meals (user_id,name,time,date) VALUES (?,?,?,?)',
    [uid,name,time,dt],
    (err, result) => {
      if (err) return res.status(500).send(err.message);
      res.json({ mealId: result.insertId });
    }
  );
};

exports.addMealItem = (req, res) => {  const mealId = req.params.mealId;
  const { name, calories, protein, carbs, fats } = req.body;
  db.query(
    `INSERT INTO meal_items 
       (meal_id,name,calories,protein,carbs,fats)
     VALUES (?,?,?,?,?,?)`,
    [mealId,name,calories,protein,carbs,fats],
    err => {
      if (err) return res.status(500).send(err.message);
      res.json({ success: true });
    }
  );
};

exports.getWaterToday = (req, res) => {
  const uid = req.session.user.id, dt = today();
  db.query(
    'SELECT glasses FROM water_log WHERE user_id=? AND date=?',
    [uid,dt],
    (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json({ glasses: (rows[0] && rows[0].glasses) || 0 });
    }
  );
};

exports.addWater = (req, res) => {
  const uid = req.session.user.id, dt = today();
  db.query(
    `INSERT INTO water_log (user_id,date,glasses)
     VALUES (?,?,1)
     ON DUPLICATE KEY UPDATE glasses=glasses+1`,
    [uid,dt],
    err => {
      if (err) return res.status(500).send(err.message);
      res.json({ success: true });
    }
  );
};

exports.getGoals = (req, res) => {
  const uid = req.session.user.id;
  db.query(
    'SELECT * FROM nutrition_goals WHERE user_id=?',
    [uid],
    (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json(rows[0] || {});
    }
  );
};

exports.setGoals = (req, res) => {
  const uid = req.session.user.id;
  const { calorie_target, protein_target, carb_target, fat_target, water_target } = req.body;
  db.query(
    `INSERT INTO nutrition_goals
       (user_id,calorie_target,protein_target,carb_target,fat_target,water_target)
     VALUES (?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       calorie_target=VALUES(calorie_target),
       protein_target=VALUES(protein_target),
       carb_target=VALUES(carb_target),
       fat_target=VALUES(fat_target),
       water_target=VALUES(water_target)`,
    [uid,calorie_target,protein_target,carb_target,fat_target,water_target],
    err => {
      if (err) return res.status(500).send(err.message);
      res.json({ success: true });
    }
  );
};
