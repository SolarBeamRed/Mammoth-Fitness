-- Drop all community-related tables in the correct order (respecting foreign keys)
SET FOREIGN_KEY_CHECKS = 0;

-- Drop hashtag related tables
DROP TABLE IF EXISTS post_hashtags;
DROP TABLE IF EXISTS hashtags;

-- Drop achievement related tables
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;

-- Drop media related tables
DROP TABLE IF EXISTS post_media;

-- Drop social interaction tables
DROP TABLE IF EXISTS post_likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS user_followers;

-- Drop main content tables
DROP TABLE IF EXISTS posts;

SET FOREIGN_KEY_CHECKS = 1;
