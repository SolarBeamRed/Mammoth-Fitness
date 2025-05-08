const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup); // Sign-Up Route
router.post('/login', authController.loginUser); // Login Route
router.get('/api/user', authController.returnUserToSession); //Provide user details to session

module.exports = router;