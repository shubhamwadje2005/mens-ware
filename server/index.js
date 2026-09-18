const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

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

// Universal Bulletproof CORS & Preflight Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, x-csrf-token"
  );

  // Instantly handle preflight OPTIONS requests with 200 OK
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
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