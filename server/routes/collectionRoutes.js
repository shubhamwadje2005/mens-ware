const express = require("express");
const router = express.Router();
const {
  getActiveCollections,
  getAllCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} = require("../controller/collectionController");
const { adminAuth } = require("../middweare/auth");

router.get("/", getActiveCollections);
router.get("/all", adminAuth, getAllCollections);
router.post("/", adminAuth, createCollection);
router.put("/:id", adminAuth, updateCollection);
router.delete("/:id", adminAuth, deleteCollection);

module.exports = router;
