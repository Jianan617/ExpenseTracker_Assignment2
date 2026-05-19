const crypto = require("crypto");

const ITERATIONS = 100000; // calculate times
const KEY_LENGTH = 32; // length of hash result
const DIGEST = "sha256"; // hash algorithm

//for password hashing when registering
function hashPassword(password) {
    //generate random salt to avoid generating a same hash from same passwords
    const salt = crypto.randomBytes(16).toString("hex");
    //apply pbkdf2 hash
    const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
    return `pbkdf2_sha256$${ITERATIONS}$${salt}$${hash}`; // password hash string
}

//verify password when logging
function verifyPassword(password, storedHash) {
    if (!password || !storedHash) return false;
    const parts = storedHash.split("$");
    //check the password format
    if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return false;

    const iterations = Number(parts[1]);
    const salt = parts[2];
    const originalHash = parts[3];
    //generate a hash by the password with the same salt and iterations
    const candidateHash = crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString("hex");

    var candidateBuffer = Buffer.from(candidateHash, "hex");
    var originalBuffer = Buffer.from(originalHash, "hex");
    //ensure the two Buffers' length are the same
    if (candidateBuffer.length !== originalBuffer.length) {
        return false;
    }
    //compare the generated hash with that one in database, return the comparison result
    return crypto.timingSafeEqual(candidateBuffer, originalBuffer);
}

module.exports = { hashPassword, verifyPassword };
