USE mammoth_fitness;	

DROP TABLE IF EXISTS workout_history;
DROP TABLE IF EXISTS plan_exercises;
DROP TABLE IF EXISTS user_plan;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS users;

-- user table
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL
);

-- default plans table
CREATE TABLE plans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_by  INT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- exercises table
CREATE TABLE exercises (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  image_url    VARCHAR(255),
  instructions TEXT
);

-- user_plan table
CREATE TABLE user_plan (
  user_id    INT NOT NULL,
  plan_id    INT NOT NULL,
  start_date DATE NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id)       ON DELETE CASCADE
);

-- plan_exercises table
CREATE TABLE plan_exercises (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  plan_id       INT NOT NULL,
  exercise_id   INT NOT NULL,
  day_of_week   ENUM('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  FOREIGN KEY (plan_id)     REFERENCES plans(id)     ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- workout_history table
CREATE TABLE workout_history (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  exercise_id  INT,
  plan_id      INT,
  occurred_on  DATE NOT NULL,
  sets         INT NOT NULL,
  reps         INT NOT NULL,
  weight       DECIMAL(5,1),
  notes        TEXT,
  FOREIGN KEY (user_id)     REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)   ON DELETE SET NULL,
  FOREIGN KEY (plan_id)     REFERENCES plans(id)       ON DELETE SET NULL
);

-- Insert workout plans
INSERT INTO plans (id, name, description, created_by) VALUES
(1, 'Push/Pull/Legs',     'Three-day split: Push, Pull, Legs on M/W/F and repeats on Th/Sa.', NULL),
(2, 'Bro Split',          'Five-day split: Chest, Back, Shoulders, Arms, Legs.', NULL),
(3, 'Full Body Strength', 'Three days/week: Squat, Bench Press, Deadlift each session.', NULL),
(4, 'Upper/Lower Split',  'Four days/week: Upper on M/Th, Lower on T/F.', NULL),
(5, 'HIIT Circuit',       '8-exercise circuit (30s on/15s off) × 4 rounds, M/W/F.', NULL);

-- Insert exercises (note: only including exercises that are actually used in plan_exercises)
INSERT INTO exercises (id, name, image_url, instructions) VALUES
(1,  'Bench Press',      'images/exercises/bench_press.jpg',      ''),
(2,  'Squat',            'images/exercises/squat.jpg',            ''),
(3,  'Deadlift',         'images/exercises/deadlift.jpg',         ''),
(4,  'Overhead Press',   'images/exercises/overhead_press.jpg',   ''),
(5,  'Pull-Up',          'images/exercises/pull_up.jpg',          ''),
(6,  'Barbell Row',      'images/exercises/barbell_row.jpg',      ''),
(7,  'Lunge',            'images/exercises/lunge.jpg',            ''),
(8,  'Bicep Curl',       'images/exercises/bicep_curl.jpg',       ''),
(9,  'Triceps Dip',      'images/exercises/triceps_dip.jpg',      ''),
(10, 'Plank',            'images/exercises/plank.jpg',            ''),
(11, 'Russian Twist',    'images/exercises/russian_twist.jpg',    ''),
(12, 'Leg Press',        'images/exercises/leg_press.jpg',        ''),
(13, 'Calf Raise',       'images/exercises/calf_raise.jpg',       ''),
(14, 'Hip Thrust',       'images/exercises/hip_thrust.jpg',       ''),
(15, 'Chest Fly',        'images/exercises/chest_fly.jpg',        ''),
(16, 'Lat Pulldown',     'images/exercises/lat_pulldown.jpg',     ''),
(19, 'Kettlebell Swing', 'images/exercises/kettlebell_swing.jpg', ''),
(20, 'Mountain Climber', 'images/exercises/mountain_climber.jpg', '');

-- Plan 1: Push/Pull/Legs
INSERT INTO plan_exercises (plan_id, exercise_id, day_of_week, display_order) VALUES
-- Push days (Monday/Thursday)
(1,1,'Monday',1),(1,15,'Monday',2),(1,4,'Monday',3),(1,9,'Monday',4),(1,14,'Monday',5),(1,20,'Monday',6),
(1,1,'Thursday',1),(1,15,'Thursday',2),(1,4,'Thursday',3),(1,9,'Thursday',4),(1,14,'Thursday',5),(1,20,'Thursday',6),
-- Pull days (Tuesday/Friday)  
(1,5,'Tuesday',1),(1,6,'Tuesday',2),(1,8,'Tuesday',3),(1,16,'Tuesday',4),(1,19,'Tuesday',5),(1,10,'Tuesday',6),
(1,5,'Friday',1),(1,6,'Friday',2),(1,8,'Friday',3),(1,16,'Friday',4),(1,19,'Friday',5),(1,10,'Friday',6),
-- Leg days (Wednesday/Saturday)
(1,2,'Wednesday',1),(1,7,'Wednesday',2),(1,12,'Wednesday',3),(1,13,'Wednesday',4),(1,14,'Wednesday',5),
(1,2,'Saturday',1),(1,7,'Saturday',2),(1,12,'Saturday',3),(1,13,'Saturday',4),(1,14,'Saturday',5);

-- Plan 2: Bro Split (COMMENTED OUT - contains references to non-existent exercises)
-- Uncomment and fix exercise IDs before using
/*
INSERT INTO plan_exercises (plan_id, exercise_id, day_of_week, display_order) VALUES
(2,1,'Monday',1),(2,15,'Monday',2),(2,21,'Monday',3),(2,22,'Monday',4),
(2,5,'Tuesday',1),(2,6,'Tuesday',2),(2,16,'Tuesday',3),(2,19,'Tuesday',4),
(2,4,'Wednesday',1),(2,23,'Wednesday',2),(2,24,'Wednesday',3),(2,14,'Wednesday',4),
(2,8,'Thursday',1),(2,9,'Thursday',2),(2,25,'Thursday',3),(2,26,'Thursday',4),
(2,2,'Friday',1),(2,12,'Friday',2),(2,7,'Friday',3),(2,13,'Friday',4);
*/

-- Plan 3: Full Body Strength
INSERT INTO plan_exercises (plan_id, exercise_id, day_of_week, display_order) VALUES
(3,2,'Monday',1),(3,1,'Monday',2),(3,3,'Monday',3),(3,14,'Monday',4),
(3,2,'Wednesday',1),(3,1,'Wednesday',2),(3,3,'Wednesday',3),(3,14,'Wednesday',4),
(3,2,'Friday',1),(3,1,'Friday',2),(3,3,'Friday',3),(3,14,'Friday',4);

-- Plan 4: Upper/Lower Split
INSERT INTO plan_exercises (plan_id, exercise_id, day_of_week, display_order) VALUES
(4,1,'Monday',1),(4,6,'Monday',2),(4,4,'Monday',3),(4,9,'Monday',4),
(4,2,'Tuesday',1),(4,3,'Tuesday',2),(4,12,'Tuesday',3),(4,13,'Tuesday',4),
(4,5,'Thursday',1),(4,15,'Thursday',2),(4,9,'Thursday',3),(4,16,'Thursday',4),
(4,2,'Friday',1),(4,7,'Friday',2),(4,12,'Friday',3),(4,13,'Friday',4);

-- Plan 5: HIIT Circuit
INSERT INTO plan_exercises (plan_id, exercise_id, day_of_week, display_order) VALUES
(5,20,'Monday',1),(5,11,'Monday',2),(5,19,'Monday',3),(5,7,'Monday',4),(5,10,'Monday',5),(5,8,'Monday',6),(5,9,'Monday',7),(5,5,'Monday',8),
(5,20,'Wednesday',1),(5,11,'Wednesday',2),(5,19,'Wednesday',3),(5,7,'Wednesday',4),(5,10,'Wednesday',5),(5,8,'Wednesday',6),(5,9,'Wednesday',7),(5,5,'Wednesday',8),
(5,20,'Friday',1),(5,11,'Friday',2),(5,19,'Friday',3),(5,7,'Friday',4),(5,10,'Friday',5),(5,8,'Friday',6),(5,9,'Friday',7),(5,5,'Friday',8);