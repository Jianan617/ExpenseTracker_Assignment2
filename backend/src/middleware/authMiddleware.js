const { verifyToken } = require("../utils/token");

//check the token is authenticated
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || "";
    //get token
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, message: "Authentication token is required." });
    }

    try {
        //verify the token
        req.user = verifyToken(token);
        next(); // continue the process
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
}

//check if the user is admin
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ success: false, message: "Admin access is required." });
    }
    next(); // continue the process
}

module.exports = { authenticateToken, requireAdmin };
