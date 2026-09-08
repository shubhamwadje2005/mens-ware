const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getDeletedProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  toggleAvailability,
  getCategories,
} = require("../controller/productController");
const { auth, adminAuth } = require("../middweare/auth");

router.get("/", getAllProducts);
router.get("/categories", getCategories);
router.get("/deleted", adminAuth, getDeletedProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.post("/", adminAuth, createProduct);
router.put("/:id", adminAuth, updateProduct);
router.patch("/:id/toggle-availability", adminAuth, toggleAvailability);
router.put("/:id/toggle-availability", adminAuth, toggleAvailability);
router.put("/:id/restore", adminAuth, restoreProduct);
router.delete("/:id", adminAuth, deleteProduct);

module.exports = router;
