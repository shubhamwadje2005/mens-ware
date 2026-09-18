const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// Security Headers (SEC-010)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// HTTP Compression (PERF-004)
app.use(compression());

// Strict CORS Whitelist (SEC-006)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://client-mens-ware.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    const isAllowed =
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== "production" &&
        (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")));

    if (isAllowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, x-csrf-token"
  );

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Rate Limiting (SEC-009)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later." },
});

const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages sent. Please try again later." },
});

app.use(generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/admin/login", authLimiter);
app.use("/api/messages", messageLimiter);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/menswear";

let cachedPromise = null;

async function connectDB() {
  if (cachedPromise && mongoose.connection.readyState === 1) {
    return cachedPromise;
  }
  if (!cachedPromise || mongoose.connection.readyState === 0) {
    cachedPromise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    }).then((m) => {
      console.log("MongoDB connected successfully");
      return m;
    }).catch((err) => {
      cachedPromise = null;
      console.error("MongoDB connection error:", err);
      throw err;
    });
  }
  return cachedPromise;
}

// Ensure DB is connected before processing API requests (crucial for Vercel serverless)
app.use(async (req, res, next) => {
  if (req.path === "/") return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection middleware error:", err.message);
    res.status(500).json({ error: "Database connection unavailable", details: err.message });
  }
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Mens Wear API running" });
});

// Start local server if not running in a serverless environment (e.g. Vercel)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }).catch((err) => {
    console.error("Failed to start local server:", err.message);
  });
}

module.exports = app;