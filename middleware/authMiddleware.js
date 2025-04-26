const Admin = require("../model/adminSchema.js")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const secret = process.env.JWT_SECRET

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" })
    }

    const token = authHeader.split(' ')[1]
    try {

        const decoded = jwt.verify(token, secret)
        req.user = { id: decoded.id }
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
    try {
        console.log("Checking admin access for user ID:", req.user?.id)

        if (!req.user || !req.user.id) {
            console.log("Unauthorized access")
            return res.status(401).json({ message: "Unauthorized access" })
        }

        const admin = await Admin.findById(req.user.id)

        if (!admin) {
            console.log("Access forbidden")
            return res.status(403).json({ message: "Access forbidden" })
        }
        next()
    } catch (error) {
        console.error('Admin authentication error:', error.message)
        return res
            .status(500)
            .json({ message: 'Admin authentication error', error: error.message })
    }
}

module.exports = { authenticateUser, isAdmin }