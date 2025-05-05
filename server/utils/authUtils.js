const crypto = require('crypto');

// Use a strong algorithm like PBKDF2, which is better than simple SHA256
const HASH_ITERATIONS = 10000; // Number of iterations
const HASH_KEYLEN = 64;       // Length of the derived key
const HASH_DIGEST = 'sha512'; // Digest algorithm

/**
 * Hashes a password using PBKDF2 with a random salt.
 * @param {string} password - The password to hash.
 * @returns {{salt: string, hash: string}} - Object containing the salt and hash.
 */
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST).toString('hex');
    return { salt, hash };
}

/**
 * Verifies a password against a stored salt and hash.
 * @param {string} password - The password attempt.
 * @param {string} salt - The stored salt.
 * @param {string} storedHash - The stored hash.
 * @returns {boolean} - True if the password is correct, false otherwise.
 */
function verifyPassword(password, salt, storedHash) {
    const hashAttempt = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST).toString('hex');
    return storedHash === hashAttempt;
}

module.exports = { hashPassword, verifyPassword };