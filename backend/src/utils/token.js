const crypto = require("crypto");

function base64UrlEncode(value) {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function base64UrlDecode(value) {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

//get JWT key
function getSecret() {
    return process.env.JWT_SECRET || "development-secret-change-before-submission";
}

//generate token
function signToken(payload, expiresInSeconds = 60 * 60 * 3) {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const body = { ...payload, iat: now, exp: now + expiresInSeconds };

    const encodedHeader = base64UrlEncode(header);
    const encodedBody = base64UrlEncode(body);
    //generate signature
    const signature = crypto
        .createHmac("sha256", getSecret())
        .update(`${encodedHeader}.${encodedBody}`)
        .digest("base64url");

    //return the completed token
    return `${encodedHeader}.${encodedBody}.${signature}`;
}

//verify the token if it's valid
function verifyToken(token) {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid token format.");

    const [encodedHeader, encodedBody, signature] = parts;

    //recalculate the signature again
    const expectedSignature = crypto
        .createHmac("sha256", getSecret())
        .update(`${encodedHeader}.${encodedBody}`)
        .digest("base64url");

    var signatureBuffer = Buffer.from(signature);
    var expectedSignatureBuffer = Buffer.from(expectedSignature);

    //verify the length of Buffers first
    if(signatureBuffer.length !== expectedSignatureBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)){
        throw new Error("Invalid token signature.");
    }

    const payload = base64UrlDecode(encodedBody);
    //ensure the token is not expired
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
        throw new Error("Token expired.");
    }
    return payload;
}

module.exports = { signToken, verifyToken };
