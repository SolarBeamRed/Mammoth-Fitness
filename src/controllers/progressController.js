const db = require('../db');

exports.getProgressMetrics = (req, res) => {
    const userId = req.session.user.id;
    const query = `
        SELECT metric_name, value, recorded_at 
        FROM progress_metrics 
        WHERE user_id = ? 
        ORDER BY recorded_at DESC`;
    
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching metrics' });
        res.json(results);
    });
};

exports.addProgressMetric = (req, res) => {
    const userId = req.session.user.id;
    const { metric_name, value } = req.body;
    
    const query = `
        INSERT INTO progress_metrics (user_id, metric_name, value, recorded_at)
        VALUES (?, ?, ?, NOW())`;
    
    db.query(query, [userId, metric_name, value], (err) => {
        if (err) return res.status(500).json({ error: 'Error saving metric' });
        res.json({ message: 'Metric saved successfully' });
    });
};

exports.getMeasurements = (req, res) => {
    const userId = req.session.user.id;
    const query = `
        SELECT * FROM body_measurements 
        WHERE user_id = ? 
        ORDER BY recorded_at DESC`;
    
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching measurements' });
        res.json(results);
    });
};

exports.addMeasurement = (req, res) => {
    const userId = req.session.user.id;
    const { weight, body_fat, chest, waist, hips, biceps, thighs } = req.body;
    
    const query = `
        INSERT INTO body_measurements 
        (user_id, weight, body_fat, chest, waist, hips, biceps, thighs, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    
    db.query(query, [userId, weight, body_fat, chest, waist, hips, biceps, thighs], (err) => {
        if (err) return res.status(500).json({ error: 'Error saving measurements' });
        res.json({ message: 'Measurements saved successfully' });
    });
};

// Temporarily disabled photo functionality
exports.getProgressPhotos = (req, res) => {
    res.json([]); // Return empty array for now
};

exports.addProgressPhoto = (req, res) => {
    res.status(501).json({ error: 'Photo upload temporarily disabled' });
};

exports.deleteProgressPhoto = (req, res) => {
    res.status(501).json({ error: 'Photo deletion temporarily disabled' });
};

exports.getExerciseProgress = (req, res) => {
    const userId = req.session.user.id;
    const exerciseId = req.params.exerciseId;
    
    const query = `
        SELECT wh.*, e.name as exercise_name
        FROM workout_history wh
        JOIN exercises e ON wh.exercise_id = e.id
        WHERE wh.user_id = ? AND wh.exercise_id = ?
        ORDER BY wh.occurred_on DESC`;
    
    db.query(query, [userId, exerciseId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching exercise progress' });
        res.json(results);
    });
};

exports.getAllExercisesProgress = (req, res) => {
    const userId = req.session.user.id;
    
    const query = `
        SELECT e.name as exercise_name,
               MAX(wh.weight) as max_weight,
               MAX(wh.occurred_on) as last_performed
        FROM workout_history wh
        JOIN exercises e ON wh.exercise_id = e.id
        WHERE wh.user_id = ?
        GROUP BY e.id
        ORDER BY last_performed DESC`;
    
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching exercises progress' });
        res.json(results);
    });
};
