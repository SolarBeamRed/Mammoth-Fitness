const express = require('express');
const router  = express.Router();
const workoutController = require('../controllers/workoutController');

router.get('/exercises',            workoutController.getExercises);
router.get('/plans',                workoutController.getAllPlans);
router.get('/user/plan',            workoutController.getUserPlan);
router.get('/workout/history',      workoutController.getWorkoutHistory);
router.get('/plans/:id/details',    workoutController.getPlanDetails);

router.delete('/plans/:id',         workoutController.deletePlan);

router.post('/plans',               workoutController.createCustomPlan);
router.post('/user/plan',           workoutController.setUserPlan);
router.post('/workout/log',         workoutController.logWorkout);

module.exports = router;
