// Database connection module
const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'bunny',
    database: 'blood_donation_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    authPlugin: 'mysql_native_password'
});

// Initialize database and create tables
async function initializeDatabase() {
    try {
        // Create database if it doesn't exist
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'bunny',
            authPlugin: 'mysql_native_password'
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS blood_donation_portal');
        await connection.end();

        // Create tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                email VARCHAR(255) PRIMARY KEY,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS profiles (
                email VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255),
                age INT,
                qualifications VARCHAR(255),
                bloodGroup VARCHAR(10),
                phoneNumber VARCHAR(20),
                address TEXT,
                emergencyContact VARCHAR(20),
                occupation VARCHAR(255),
                donationType VARCHAR(100),
                lastDonationDate DATE,
                healthConditions TEXT,
                medicalHistory TEXT,
                allergies TEXT,
                profilePic TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255),
                name VARCHAR(255),
                bloodGroup VARCHAR(10),
                amount INT,
                location VARCHAR(255),
                message TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                donor_email VARCHAR(255),
                requester_email VARCHAR(255),
                quantity INT,
                situation TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (donor_email) REFERENCES users(email) ON DELETE CASCADE,
                FOREIGN KEY (requester_email) REFERENCES users(email) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                email VARCHAR(255) PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
            )
        `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = { pool, initializeDatabase };


