-- Sample data for community features

-- Ensure we have a test user
INSERT IGNORE INTO users (id, username, email, password) 
VALUES (1, 'testuser', 'test@example.com', '$2b$10$B6t3vMZpwoNkGJYQVX3bDOLjE6.JBHUHIxLkZRZEIWUWSxJ0oTJjK');

-- Sample posts
INSERT INTO posts (user_id, content, type) VALUES
(1, 'Just completed my first 5K run! 🏃‍♂️ #fitness #achievement', 'workout'),
(1, 'Down 5kg this month! Progress is showing 💪 #weightloss', 'progress'),
(1, 'Who else is hitting the gym today? Let\'s motivate each other! 💯', 'post');

-- Sample comments
INSERT INTO comments (post_id, user_id, content) VALUES
(1, 1, 'Thanks everyone for the support!'),
(2, 1, 'Hard work pays off!'),
(3, 1, 'Let\'s do this!');

-- Sample likes (self-likes for testing)
INSERT INTO likes (post_id, user_id) VALUES
(1, 1),
(2, 1);

-- Sample achievements
INSERT INTO achievements (name, description, badge_url) VALUES
('First Post', 'Created your first post', '/images/badges/first-post.png'),
('Social Butterfly', 'Made 10 comments', '/images/badges/social.png'),
('Fitness Enthusiast', 'Logged 10 workouts', '/images/badges/fitness.png');

-- Sample user achievements
INSERT INTO user_achievements (user_id, achievement_id, progress, completed_at) VALUES
(1, 1, 100, CURRENT_TIMESTAMP),
(1, 2, 30, NULL),
(1, 3, 50, NULL);