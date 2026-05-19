const crypto = require("crypto");

const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
    return `pbkdf2_sha256$${ITERATIONS}$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
    if (!password || !storedHash) return false;
    const parts = storedHash.split("$");
    if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return false;

    const iterations = Number(parts[1]);
    const salt = parts[2];
    const originalHash = parts[3];
    const candidateHash = crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString("hex");

    return crypto.timingSafeEqual(Buffer.from(candidateHash, "hex"), Buffer.from(originalHash, "hex"));
}

module.exports = { hashPassword, verifyPassword };
