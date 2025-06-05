-- A) Logging meals and their items
CREATE TABLE meals (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  name      ENUM('Breakfast','Lunch','Dinner','Snack') NOT NULL,
  time      TIME NOT NULL,
  date      DATE    NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE meal_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  meal_id    INT NOT NULL,
  name       VARCHAR(255) NOT NULL,
  calories   INT NOT NULL,
  protein    INT NOT NULL,
  carbs      INT NOT NULL,
  fats       INT NOT NULL,
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);

-- B) Water intake per day
CREATE TABLE water_log (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  date      DATE    NOT NULL,
  glasses   INT NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

-- C) Daily nutrition goals
CREATE TABLE nutrition_goals (
  user_id         INT PRIMARY KEY,
  calorie_target  INT NOT NULL,
  protein_target  INT NOT NULL,
  carb_target     INT NOT NULL,
  fat_target      INT NOT NULL,
  water_target    INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);