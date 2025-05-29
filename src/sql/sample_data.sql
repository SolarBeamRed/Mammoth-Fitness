-- Sample progress data
INSERT IGNORE INTO users (id, username, email, password) 
VALUES (1, 'testuser', 'test@example.com', '$2b$10$B6t3vMZpwoNkGJYQVX3bDOLjE6.JBHUHIxLkZRZEIWUWSxJ0oTJjK');

-- Sample progress metrics
INSERT INTO progress_metrics (user_id, metric_name, value, recorded_at) VALUES
(1, 'weight', 75.5, '2025-05-01'),
(1, 'weight', 74.8, '2025-05-08'),
(1, 'weight', 74.2, '2025-05-15'),
(1, 'weight', 73.6, '2025-05-22'),
(1, 'body_fat', 18.5, '2025-05-01'),
(1, 'body_fat', 18.0, '2025-05-08'),
(1, 'body_fat', 17.6, '2025-05-15'),
(1, 'body_fat', 17.2, '2025-05-22');

-- Sample body measurements
INSERT INTO body_measurements 
(user_id, weight, body_fat, muscle_mass, chest, waist, hips, biceps, thighs, recorded_at) VALUES
(1, 75.5, 18.5, 65.2, 102.0, 84.0, 98.0, 36.0, 58.0, '2025-05-01'),
(1, 74.8, 18.0, 65.5, 101.5, 83.0, 97.5, 36.5, 58.5, '2025-05-08'),
(1, 74.2, 17.6, 65.8, 101.0, 82.0, 97.0, 37.0, 59.0, '2025-05-15'),
(1, 73.6, 17.2, 66.0, 100.5, 81.0, 96.5, 37.5, 59.5, '2025-05-22');

-- Sample exercise data
INSERT IGNORE INTO exercises (id, name, image_url, instructions) VALUES
(1, 'Bench Press', NULL, 'Lie on bench, lower bar to chest, press up'),
(2, 'Squat', NULL, 'Stand with bar on shoulders, squat down, stand up'),
(3, 'Deadlift', NULL, 'Stand with bar at feet, lift bar up, lower back down');

INSERT INTO exercise_progress (user_id, exercise_id, weight, reps, sets, recorded_at) VALUES
(1, 1, 80.0, 8, 3, '2025-05-01'),
(1, 1, 82.5, 8, 3, '2025-05-08'),
(1, 1, 85.0, 8, 3, '2025-05-15'),
(1, 1, 87.5, 8, 3, '2025-05-22'),
(1, 2, 100.0, 8, 3, '2025-05-01'),
(1, 2, 105.0, 8, 3, '2025-05-08'),
(1, 2, 110.0, 8, 3, '2025-05-15'),
(1, 2, 115.0, 8, 3, '2025-05-22'),
(1, 3, 120.0, 6, 3, '2025-05-01'),
(1, 3, 125.0, 6, 3, '2025-05-08'),
(1, 3, 130.0, 6, 3, '2025-05-15'),
(1, 3, 135.0, 6, 3, '2025-05-22');
