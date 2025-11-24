const fs = require('fs');
const path = require('path');

const DEBUG_LOG = path.join(__dirname, 'debug.log');

function logDebug(msg) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${msg}\n`;
    try {
        fs.appendFileSync(DEBUG_LOG, logLine);
        console.log("Successfully wrote to " + DEBUG_LOG);
    } catch (e) {
        console.error("Failed to write: " + e.message);
    }
}

logDebug("Test log entry");
