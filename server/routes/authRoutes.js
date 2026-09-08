const express = require("express");
const router = express.Router();
const {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  adminLogout,
} = require("../controller/authController");
const { auth } = require("../middweare/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.post("/admin-logout", adminLogout);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.post("/address", auth, addAddress);
router.put("/address/:addressId", auth, updateAddress);
router.delete("/address/:addressId", auth, deleteAddress);

module.exports = router;
