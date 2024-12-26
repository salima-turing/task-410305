const express = require('express');
const app = express();
const PORT = 4000;

const idleTimeout = 300000; // 5 minutes
let activeConnections = new Map();

app.get('/data', (req, res) => {
    const connectionId = Date.now(); // Unique connection ID
    let idleTimer;

    // Set an idle timeout for the connection
    const resetIdleTimer = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            console.log(`Connection ${connectionId} timed out.`);
            activeConnections.delete(connectionId); // Cleanup
        }, idleTimeout);
    };

    // Store active connections
    activeConnections.set(connectionId, res);

    // Reset idle timer on activity
    resetIdleTimer();

    // Simulated data response
    res.json({ message: "Data fetched successfully!" });

    // Optionally reset the timer for subsequent requests
    resetIdleTimer();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
