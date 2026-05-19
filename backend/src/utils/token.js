const crypto = require("crypto");

function base64UrlEncode(value) {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function base64UrlDecode(value) {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function getSecret() {
    return process.env.JWT_SECRET || "development-secret-change-before-submission";
}

function signToken(payload, expiresInSeconds = 60 * 60 * 3) {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const body = { ...payload, iat: now, exp: now + expiresInSeconds };

    const encodedHeader = base64UrlEncode(header);
    const encodedBody = base64UrlEncode(body);
    const signature = crypto
        .createHmac("sha256", getSecret())
        .update(`${encodedHeader}.${encodedBody}`)
        .digest("base64url");

    return `${encodedHeader}.${encodedBody}.${signature}`;
}

function verifyToken(token) {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid token format.");

    const [encodedHeader, encodedBody, signature] = parts;
    const expectedSignature = crypto
        .createHmac("sha256", getSecret())
        .update(`${encodedHeader}.${encodedBody}`)
        .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        throw new Error("Invalid token signature.");
    }

    const payload = base64UrlDecode(encodedBody);
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
        throw new Error("Token expired.");
    }
    return payload;
}

module.exports = { signToken, verifyToken };
