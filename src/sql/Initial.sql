Create database  mammoth_fitness;
use mammoth_fitness;
Create table  users (id int auto increment primary key, username varchar(255), email varchar(255) unique, password varchar(255));

DROP TABLE IF EXISTS workout_history;
DROP TABLE IF EXISTS plan_exercises;
DROP TABLE IF EXISTS user_plan;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL
);

CREATE TABLE plans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_by  INT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE exercises (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  image_url    VARCHAR(255),
  instructions TEXT
);

CREATE TABLE user_plan (
  user_id    INT NOT NULL,
  plan_id    INT NOT NULL,
  start_date DATE NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id)       ON DELETE CASCADE
);

CREATE TABLE plan_exercises (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  plan_id       INT NOT NULL,
  exercise_id   INT NOT NULL,
  day_of_week   ENUM('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  FOREIGN KEY (plan_id)     REFERENCES plans(id)     ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE workout_history (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  exercise_id  INT NOT NULL,
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


