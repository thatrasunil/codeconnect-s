const fs = require('fs');
const path = require('path');

// Ensure log directory exists (Use /tmp in Vercel or don't log to file)
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
const logDir = isVercel ? path.join('/tmp', 'data') : path.join(__dirname, '../../data');

if (!fs.existsSync(logDir)) {
    try {
        fs.mkdirSync(logDir, { recursive: true });
    } catch (e) {
        console.error("Failed to create log directory:", e);
    }
}

const logFile = path.join(logDir, 'activity.log');

const logEvent = (action, meta = {}) => {
    const entry = {
        timestamp: new Date().toISOString(),
        action,
        ...meta
    };

    // Always log to console in serverless (captured by Vercel logs)
    if (isVercel) {
        console.log(`[LOG] ${JSON.stringify(entry)}`);
        return;
    }

    try {
        fs.appendFile(logFile, JSON.stringify(entry) + '\n', (err) => {
            if (err) console.error("Failed to write to log file:", err);
        });
    } catch (error) {
        console.error("Logging error:", error);
    }
};

module.exports = { logEvent };
