const express = require("express");
const router = express.Router();
const {
  getActiveCampaign,
  getAllCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} = require("../controller/campaignController");
const { adminAuth } = require("../middweare/auth");

// Public routes
router.get("/active", getActiveCampaign);

// Admin protected routes
router.get("/all", adminAuth, getAllCampaigns);
router.post("/create", adminAuth, createCampaign);
router.put("/update/:id", adminAuth, updateCampaign);
router.delete("/delete/:id", adminAuth, deleteCampaign);

module.exports = router;
