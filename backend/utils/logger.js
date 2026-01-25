const fs = require('fs');
const path = require('path');

// Ensure log directory exists
const logDir = path.join(__dirname, '../../data');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'activity.log');

const logEvent = (action, meta = {}) => {
    const entry = {
        timestamp: new Date().toISOString(),
        action,
        ...meta
    };

    try {
        fs.appendFile(logFile, JSON.stringify(entry) + '\n', (err) => {
            if (err) console.error("Failed to write to log file:", err);
        });
    } catch (error) {
        console.error("Logging error:", error);
    }
};

module.exports = { logEvent };
