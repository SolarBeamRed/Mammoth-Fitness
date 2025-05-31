const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const auth = require('../middleware/auth');

// Protect all routes with authentication
router.use(auth);

// Posts
router.post('/posts', communityController.createPost.bind(communityController));
router.get('/posts', communityController.getFeedPosts.bind(communityController));

// Likes
router.post('/posts/:postId/like', communityController.toggleLike.bind(communityController));

// Comments
router.post('/posts/:postId/comments', communityController.addComment.bind(communityController));

// Follow/Unfollow
router.post('/users/:userId/follow', communityController.toggleFollow.bind(communityController));

module.exports = router;
