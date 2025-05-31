const db = require('../db');

class CommunityController {
    // Create a new post
    async createPost(req, res) {
        const { content, type } = req.body;
        const userId = req.user.id;

        try {
            const query = `
                INSERT INTO posts (user_id, content, type)
                VALUES (?, ?, ?)`;
            
            const result = await db.query(query, [userId, content, type]);
            const postId = result.insertId;

            // Extract and save hashtags
            const hashtags = content.match(/#(\w+)/g) || [];
            if (hashtags.length > 0) {
                await this.saveHashtags(hashtags, postId);
            }

            res.status(201).json({ id: postId });
        } catch (err) {
            console.error('Error creating post:', err);
            res.status(500).json({ error: 'Failed to create post' });
        }
    }

    // Save hashtags for a post
    async saveHashtags(hashtags, postId) {
        const hashtagValues = hashtags.map(tag => [tag.slice(1).toLowerCase(), postId]); // Remove # and convert to lowercase
        
        try {
            const query = `
                INSERT INTO hashtags (tag, post_id)
                VALUES ?`;
            
            await db.query(query, [hashtagValues]);
        } catch (err) {
            console.error('Error saving hashtags:', err);
            throw err;
        }
    }

    // Get feed posts
    async getFeedPosts(req, res) {
        try {
            const query = `
                SELECT 
                    p.id, 
                    p.content, 
                    p.type,
                    p.created_at,
                    u.username,
                    COUNT(DISTINCT l.id) as likes_count,
                    COUNT(DISTINCT c.id) as comments_count,
                    EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND post_id = p.id) as user_liked
                FROM posts p
                JOIN users u ON p.user_id = u.id
                LEFT JOIN likes l ON p.id = l.post_id
                LEFT JOIN comments c ON p.id = c.post_id
                GROUP BY p.id
                ORDER BY p.created_at DESC
                LIMIT 20`;
            
            const posts = await db.query(query, [req.user.id]);
            res.json(posts);
        } catch (err) {
            console.error('Error fetching feed:', err);
            res.status(500).json({ error: 'Failed to fetch feed' });
        }
    }

    // Toggle like on a post
    async toggleLike(req, res) {
        const postId = req.params.postId;
        const userId = req.user.id;

        try {
            // Check if like exists
            const checkQuery = `
                SELECT id FROM likes 
                WHERE user_id = ? AND post_id = ?`;
            
            const existing = await db.query(checkQuery, [userId, postId]);

            if (existing.length > 0) {
                // Unlike
                await db.query(
                    'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
                    [userId, postId]
                );
                res.json({ liked: false });
            } else {
                // Like
                await db.query(
                    'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
                    [userId, postId]
                );
                res.json({ liked: true });
            }
        } catch (err) {
            console.error('Error toggling like:', err);
            res.status(500).json({ error: 'Failed to toggle like' });
        }
    }

    // Add a comment
    async addComment(req, res) {
        const postId = req.params.postId;
        const userId = req.user.id;
        const { content } = req.body;

        try {
            const query = `
                INSERT INTO comments (user_id, post_id, content)
                VALUES (?, ?, ?)`;
            
            const result = await db.query(query, [userId, postId, content]);
            res.status(201).json({ id: result.insertId });
        } catch (err) {
            console.error('Error adding comment:', err);
            res.status(500).json({ error: 'Failed to add comment' });
        }
    }

    // Toggle follow
    async toggleFollow(req, res) {
        const followerId = req.user.id;
        const followingId = req.params.userId;

        if (followerId === followingId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        try {
            // Check if already following
            const checkQuery = `
                SELECT id FROM follows 
                WHERE follower_id = ? AND following_id = ?`;
            
            const existing = await db.query(checkQuery, [followerId, followingId]);

            if (existing.length > 0) {
                // Unfollow
                await db.query(
                    'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
                    [followerId, followingId]
                );
                res.json({ following: false });
            } else {
                // Follow
                await db.query(
                    'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
                    [followerId, followingId]
                );
                res.json({ following: true });
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
            res.status(500).json({ error: 'Failed to toggle follow' });
        }
    }
}

module.exports = new CommunityController();
