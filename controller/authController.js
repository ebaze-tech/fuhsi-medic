const express = require("express")
const Admin = require("../model/admin")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

require("dotenv").config()

const adminAuthController = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        console.log("Email and password are required")
        return res.status(400).json({ message: "Email and password are required" })
    }

    try {
        const user = await Admin.findOne({ email }).select('+password')
        if (!user) {
            console.log("Invalid email")
            return res.status(400).json({ message: "Invalid email" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            console.log("Invalid password")
            return res.status(400).json({ message: "Invalid password" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" })
        const userDetails = {
            id: user._id, email: user.email
        }
        console.log('Login successful: ', { user: userDetails, token })
        return res.status(200).json({
            message: "Login successful",
            user: userDetails,
            token
        })
    } catch (error) {
        console.error("Login error:", error)
        return res.status(500).json({ message: "Login error: ", error })
    }
}

module.exports = { adminAuthController }