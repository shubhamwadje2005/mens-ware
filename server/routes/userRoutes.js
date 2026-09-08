const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserRole,
} = require("../controller/userController");
const { adminAuth } = require("../middweare/auth");

router.get("/", adminAuth, getAllUsers);
router.get("/:id", adminAuth, getUserById);
router.delete("/:id", adminAuth, deleteUser);
router.put("/:id/role", adminAuth, updateUserRole);

module.exports = router;
