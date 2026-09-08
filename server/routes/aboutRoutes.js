const express = require("express");
const router = express.Router();
const {
  getAbout,
  getAboutAdmin,
  saveAbout,
} = require("../controller/aboutController");
const { adminAuth } = require("../middweare/auth");

// Public route
router.get("/", getAbout);

// Admin protected routes
router.get("/admin", adminAuth, getAboutAdmin);
router.post("/", adminAuth, saveAbout);
router.put("/", adminAuth, saveAbout);

module.exports = router;
