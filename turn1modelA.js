const express = require('express');
const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'mysql-16bc3232-kimpact.b.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_ONJgzkx8UT3LQO3gLvK',
    database: 'turing',
    connectionLimit: 10, // defines the maximum number of connection in pool.
});

const app = express();
const PORT = 4000;

// Middleware for tracking idle connections
const idleTimeout = 120000; // 2 minutes

let activeConnections = new Map();

const trackConnectionIdle = (connectionId) => {
    const timeout = setTimeout(() => {
        console.log(`Connection ${connectionId} timed out and will be released.`);
        activeConnections.delete(connectionId);
    }, idleTimeout);

    return timeout;
};

// Route handler example
app.get('/data', (req, res) => {
    const connectionId = Date.now(); // Unique connection ID

    // Adding the timeout tracking
    const idleTracker = trackConnectionIdle(connectionId);

    pool.getConnection((err, connection) => {
        if (err) {
            res.status(500).send('Error connecting to the database');
            clearTimeout(idleTracker);
            return;
        }

        // Mark as active connection
        activeConnections.set(connectionId, { connection, idleTracker });

        // Example query
        connection.query('SELECT * FROM Users', (err, results) => {
            connection.release(); // Release connection back to the pool after query
            clearTimeout(idleTracker); // Stop idle timeout tracker

            if (err) {
                res.status(500).send('Error executing query');
                return;
            }
            res.json(results);
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
