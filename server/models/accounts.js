const fs = require('fs');
const path = require('path');

const ACCOUNTS_FILE = path.join(__dirname, '..', 'data', 'accounts.json');

/**
 * Account Manager - Handles multiple social media accounts per user
 * Structure: { userId: { twitter: {...}, linkedin: {...} } }
 */

function readAccounts() {
    try {
        if (fs.existsSync(ACCOUNTS_FILE)) {
            return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
        }
        return {};
    } catch (e) {
        console.error('Error reading accounts:', e);
        return {};
    }
}

function writeAccounts(accounts) {
    try {
        const dir = path.dirname(ACCOUNTS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
    } catch (e) {
        console.error('Error writing accounts:', e);
    }
}

/**
 * Save platform account for a user
 * @param {string} userId - User identifier
 * @param {string} platform - 'twitter' or 'linkedin'
 * @param {object} accountData - { accessToken, refreshToken, username, ... }
 */
function saveAccount(userId, platform, accountData) {
    const accounts = readAccounts();
    if (!accounts[userId]) {
        accounts[userId] = {};
    }
    accounts[userId][platform] = {
        ...accountData,
        connectedAt: new Date().toISOString()
    };
    writeAccounts(accounts);
    return accounts[userId];
}

/**
 * Get account for specific platform
 */
function getAccount(userId, platform) {
    const accounts = readAccounts();
    return accounts[userId]?.[platform] || null;
}

/**
 * Get all accounts for a user
 */
function getUserAccounts(userId) {
    const accounts = readAccounts();
    return accounts[userId] || {};
}

/**
 * Remove platform account
 */
function removeAccount(userId, platform) {
    const accounts = readAccounts();
    if (accounts[userId] && accounts[userId][platform]) {
        delete accounts[userId][platform];
        writeAccounts(accounts);
        return true;
    }
    return false;
}

module.exports = {
    saveAccount,
    getAccount,
    getUserAccounts,
    removeAccount
};
