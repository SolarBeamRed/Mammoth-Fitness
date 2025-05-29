-- Progress Metrics Table
CREATE TABLE progress_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    metric_name VARCHAR(50) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    recorded_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Body Measurements Table
CREATE TABLE body_measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    weight DECIMAL(5,2),
    body_fat DECIMAL(4,1),
    muscle_mass DECIMAL(5,2),
    chest DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    biceps DECIMAL(4,2),
    thighs DECIMAL(4,2),
    recorded_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Progress Photos Table
CREATE TABLE progress_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    category ENUM('front', 'back', 'side') NOT NULL,
    taken_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Exercise Progress Table
CREATE TABLE exercise_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    weight DECIMAL(6,2) NOT NULL,
    reps INT NOT NULL,
    sets INT NOT NULL,
    recorded_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);
