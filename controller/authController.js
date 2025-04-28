const express = require("express");
const Admin = require("../model/adminSchema.js");
const User = require("../model/userSchema.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const adminAuthController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Email and password are required");
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await Admin.findOne({ email });
    if (!user) {
      console.log("Invalid email");
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password");
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
    const userDetails = {
      id: user._id,
      email: user.email,
    };
    console.log("Login successful: ", { user: userDetails, token });
    return res.status(200).json({
      message: "Login successful",
      user: userDetails,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login error: ", error });
  }
};

const adminRegisterController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("All fields are required");
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUserByEmail = await Admin.findOne({ email });
    if (existingUserByEmail) {
      console.log("Email is already in use");
      return res.status(400).json({ message: "Email used" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new Admin({
      email,
      password: hashedPassword,
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Admin registered successfully:", { user, token });
    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user._id,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
};
const userAuthController = async (req, res) => {
  const { surname, utmeNo } = req.body;
  if (!surname || !utmeNo) {
    console.log("UTME Number and Surname are required");
    return res
      .status(400)
      .json({ message: "UTME Number and Surname are required" });
  }

  try {
    const user = await User.findOne({ utmeNo, surname }).select("surname utmeNo otherNames");

    if (!user) {
      console.log("Invalid UTME Number or Surname does not match");
      return res
        .status(400)
        .json({ message: "Invalid UTME Number or Surname does not match" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const userDetails = {
      id: user._id,
      surname: user.surname,
      utmeNo: user.utmeNo,
    };
    console.log("Login successful", { user: userDetails, token });
    return res.status(200).json({
      message: "Login successful",
      data: {
        token,
        user: userDetails,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Login error:", error: error.message });
  }
};

const userRegisterController = async (req, res) => {
  const { utmeNo, surname } = req.body;

  if (!utmeNo || !surname) {
    console.log("All fields are required");
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUserByUtmeNo = await User.findOne({ utmeNo });
    if (existingUserByUtmeNo) {
      console.log("UTME Number is already in use");
      return res.status(400).json({ message: "UTME Number already used" });
    }

    const existingUserBySurname = await User.findOne({ surname });
    if (existingUserBySurname) {
      console.log("Surname is already in use");
      return res.status(400).json({ message: "Surname already used" });
    }

    // Create new user
    const user = new User({
      utmeNo,
      surname,
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("User registered successfully:", { user, token });
    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user._id,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

module.exports = {
  adminAuthController,
  adminRegisterController,
  userAuthController,
  userRegisterController,
};
