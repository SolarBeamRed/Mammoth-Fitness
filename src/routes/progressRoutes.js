const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// Progress metrics routes
router.get('/metrics', progressController.getProgressMetrics);
router.post('/metrics', progressController.addProgressMetric);

// Body measurements routes
router.get('/measurements', progressController.getMeasurements);
router.post('/measurements', progressController.addMeasurement);

// Progress photos routes
router.get('/photos', progressController.getProgressPhotos);
router.post('/photos', progressController.addProgressPhoto);
router.delete('/photos/:id', progressController.deleteProgressPhoto);

// Exercise progress routes
router.get('/exercises/:exerciseId', progressController.getExerciseProgress);
router.get('/exercises', progressController.getAllExercisesProgress);

module.exports = router;
