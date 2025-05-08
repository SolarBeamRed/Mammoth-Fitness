const db = require('../db');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); //Hashing Password

    db.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.send('Email already exists.');
                }
                return res.send('Error creating user.');
            }
            return res.send('Signup successful.');
        }
    );
}

exports.loginUser = async (req, res) => {
    const {email, password} = req.body;

    db.query(
        'SELECT * FROM users WHERE email = ?', [email],
        async (err, results) => {
            if (err) return res.status(500).send("Sorry, server error");
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
    });
};

exports.returnUserToSession = (req, res) => {
    if(!req.session.user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    res.json(req.session.user);
};