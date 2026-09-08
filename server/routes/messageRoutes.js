const express = require("express");
const router = express.Router();
const {
  createMessage,
  getAllMessages,
  toggleReadStatus,
  deleteMessage,
} = require("../controller/messageController");
const { adminAuth } = require("../middweare/auth");

// Public route to submit contact form
router.post("/", createMessage);

// Admin protected routes
router.get("/", adminAuth, getAllMessages);
router.patch("/:id/read", adminAuth, toggleReadStatus);
router.delete("/:id", adminAuth, deleteMessage);

module.exports = router;
