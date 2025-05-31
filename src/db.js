const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Attempting to connect to database with configuration:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'mammoth_fitness'
});

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'mammoth_fitness',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the database');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message);
    });

// Wrap pool.query to handle both callback and promise-based code
const db = {
    query: async (sql, params) => {
        try {
            const [results] = await pool.query(sql, params);
            return results;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = db;