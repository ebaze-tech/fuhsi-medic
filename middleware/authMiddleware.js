const Admin = require("../model/adminSchema.js")
const jwt = require("jsonwebtoken")
const User = require("../model/userSchema.js")
require("dotenv").config()
const secret = process.env.JWT_SECRET

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" })
    }

    try {
        const token = authHeader.split(' ')[1]

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
          }
        const decoded = jwt.verify(token, secret)
        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(403).json({ message: "User Access forbidden" })
        }
        req.user = { id: user._id }
        next()
    } catch (error) {
        console.error('User authentication error:', error.message)
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        return res
            .status(500)
            .json({ message: 'User authentication error', error: error.message })
    }
}

const isAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
          }

        const decoded = jwt.verify(token, secret);
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(403).json({ message: "Access forbidden" });
        }

        req.admin = { id: admin._id };

        next();
    } catch (error) {
        console.error('Admin authentication error:', error.message);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }

        return res.status(500).json({
            message: 'Admin authentication error',
            error: error.message,
        });
    }
};


module.exports = { authenticateUser, isAdmin }