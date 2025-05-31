const db = require('../db');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); //Hashing Password

        await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        return res.send('Signup successful.');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.send('Email already exists.');
        }
        return res.send('Error creating user.');
    }
}

exports.loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        const results = await db.query(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );
        
        if (results.length === 0) return res.status(401).send("Email not found");

            const user = results[0];
            const match = await bcrypt.compare(password, user.password)
            if (!match) {
                return res.status(401).send('Incorrect password');
            }

            // Successful Login:
            req.session.user = {
                id: user.id,
                email: user.email,
                username: user.username
            };
            return res.send('Login successful');
    } catch (err) {
        return res.status(500).send('Error logging in');
    }
};

exports.returnUserToSession = (req, res) => {
    if(!req.session.user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    res.json(req.session.user);
};