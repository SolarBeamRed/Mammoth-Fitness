const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// Progress metrics routes
router.get('/measurements', progressController.getMeasurements);
router.post('/measurements', progressController.addMeasurement);

// Exercise progress routes
router.get('/exercises/:exerciseId', progressController.getExerciseProgress);
router.post('/exercises', progressController.addExerciseProgress);

module.exports = router;
