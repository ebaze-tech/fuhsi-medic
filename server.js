const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

const pdfRoute = require("./route/pdfRoute");
const authRoutes = require("./route/authRoute");
const adminDashboardRoutes = require("./route/dashboard");
const getTotalForms = require("./route/formCont");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

// CORS setup
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
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

// MongoDB connection options with timeout
const dbOptions = {
  serverSelectionTimeoutMS: 7000, // 3 seconds timeout
};

const MAX_RETRIES = 10; // maximum retry attempts
let retries = 0;

async function connectWithRetry() {
  try {
    await mongoose.connect(process.env.DB_URI, dbOptions);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    retries += 1;
    console.error(
      `❌ MongoDB connection failed (Attempt ${retries}):`,
      error.message
    );

    if (retries < MAX_RETRIES) {
      console.log(`🔄 Retrying to connect to MongoDB in 3 seconds...`);
      setTimeout(connectWithRetry, 3000); // wait 3 seconds then retry
    } else {
      console.error(
        "💥 Could not connect to MongoDB after multiple attempts. Exiting..."
      );
      process.exit(1);
    }
  }
}

// Start initial DB connection
connectWithRetry();

// Routes
app.use("/questionnaire", pdfRoute);
app.use("/auth", authRoutes);
app.use("/dashboard", adminDashboardRoutes);
app.use("/forms", getTotalForms);

// 404 Handler
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error(`[ERROR] ${error.message}`);

  const statusCode = error.status || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
