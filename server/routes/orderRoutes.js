const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  getDeletedOrders,
  updateOrderStatus,
  deleteOrder,
  restoreOrder,
} = require("../controller/orderController");
const { auth, adminAuth } = require("../middweare/auth");

router.post("/", auth, createOrder);
router.get("/", auth, getUserOrders);
router.get("/all", adminAuth, getAllOrders);
router.get("/deleted", adminAuth, getDeletedOrders);
router.get("/:id", auth, getOrderById);
router.put("/:id/status", adminAuth, updateOrderStatus);
router.put("/:id/restore", adminAuth, restoreOrder);
router.delete("/:id", adminAuth, deleteOrder);

module.exports = router;
