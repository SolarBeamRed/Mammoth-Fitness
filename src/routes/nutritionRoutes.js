// File: src/routes/nutritionRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/nutritionController');

// Protect all nutrition routes
router.use((req, res, next) => {
  if (!req.session.user) return res.status(401).send('Not logged in');
  next();
});

router.get('/summary',    ctrl.getSummary);
router.get('/meals/today',ctrl.getMealsToday);
router.get('/meals/:mealId/items', ctrl.getMealItems);
router.post('/meals',       ctrl.createMeal);
router.post('/meals/:mealId/items', ctrl.addMealItem);

router.get('/water/today', ctrl.getWaterToday);
router.post('/water/add',  ctrl.addWater);

router.get('/goals',       ctrl.getGoals);
router.post('/goals',      ctrl.setGoals);

module.exports = router;
