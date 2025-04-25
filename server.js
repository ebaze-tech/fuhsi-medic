const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

const pdfRoute = require("./route/pdfRoute")
const adminAuthRoute = require("./route/adminRoute");
const { adminAuthController } = require("./controller/authController");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

// Handle form submission and PDF generation
app.use("/questionnaire", pdfRoute)
app.use("/auth", adminAuthController)


// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
