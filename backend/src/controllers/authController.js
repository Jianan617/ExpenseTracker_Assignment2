const userModel = require("../models/userModel");
const activityModel = require("../models/activityModel");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signToken } = require("../utils/token");
const { isValidEmail } = require("../utils/validators");

//filter sensitive fields
function publicUser(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    };
}

//register a user
async function register(req, res) {
    try {
        const username = String(req.body.username || "").trim();
        const email = String(req.body.email || "").trim();
        const password = String(req.body.password || "");

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Username, email and password are required." });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: "A valid email address is required." });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must contain at least 6 characters." });
        }

        //check if the username or the email existed in the database
        const existing = await userModel.findByUsernameOrEmail(username) || await userModel.findByUsernameOrEmail(email);
        if (existing) {
            return res.status(409).json({ success: false, message: "Username or email already exists." });
        }

        //create user
        const createdUser = await userModel.createUser({
            username,
            email,
            password_hash: hashPassword(password),
            role: "User",
        });

        //record the register activity
        await activityModel.createActivity(createdUser.id, "REGISTER", "User registered a new account.");

        //generate token for response
        const token = signToken(publicUser(createdUser));

        return res.status(201).json({ success: true, data: { user: publicUser(createdUser), token } });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ success: false, message: "Failed to register user." });
    }
}

async function login(req, res) {
    try {
        //identifier contains username or email, user can log in with either of them
        const identifier = String(req.body.identifier || "").trim();
        const password = String(req.body.password || "");

        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: "Username/email and password are required." });
        }
        //ensure the user is existed in the database
        const user = await userModel.findByUsernameOrEmail(identifier);
        //if user is existed, then check the password
        if (!user || !verifyPassword(password, user.password_hash)) {
            return res.status(401).json({ success: false, message: "Invalid login details." });
        }

        //record the login activity
        await activityModel.createActivity(user.id, "LOGIN", "User logged in.");
        //filter sensitive fields
        const userPayload = publicUser(user);
        //generate JWT token
        const token = signToken(userPayload);

        return res.status(200).json({ success: true, data: { user: userPayload, token } });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Failed to login." });
    }
}

//get information of current user, which has already passed the authentication
async function getMe(req, res) {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        return res.status(200).json({ success: true, data: publicUser(user) });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch profile." });
    }
}

async function logout(req, res) {
    try {
        //record the logout activity
        await activityModel.createActivity(req.user.id, "LOGOUT", "User logged out.");
        return res.status(200).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to logout." });
    }
}

module.exports = { register, login, getMe, logout };
