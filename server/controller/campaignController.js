const Campaign = require("../modal/Campaign");

// Default initial campaign data
const defaultCampaignData = {
  subtitle: "Campaign 2026",
  titleLine1: "BEYOND",
  titleLine2: "Ordinary",
  description:
    "Where convention ends, creativity begins. Our latest campaign captures the essence of those who dare to stand apart.",
  image:
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop",
  buttonText: "View Campaign",
  buttonLink: "/collections",
  isActive: true,
};

// GET /api/campaign/active - Public
exports.getActiveCampaign = async (req, res) => {
  try {
    let campaign = await Campaign.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (!campaign) {
      // Check if any campaign exists, if not seed the default one
      const count = await Campaign.countDocuments();
      if (count === 0) {
        campaign = await Campaign.create(defaultCampaignData);
      } else {
        campaign = await Campaign.findOne().sort({ updatedAt: -1 });
      }
    }
    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    console.error("Error fetching active campaign:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/campaign/all - Admin only
exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/campaign/create - Admin only
exports.createCampaign = async (req, res) => {
  try {
    const {
      subtitle,
      titleLine1,
      titleLine2,
      description,
      image,
      buttonText,
      buttonLink,
      isActive,
    } = req.body;

    if (!titleLine1 || !image) {
      return res.status(400).json({
        success: false,
        message: "Title and Image are required",
      });
    }

    // If this campaign is set to active, optionally deactivate other campaigns
    if (isActive) {
      await Campaign.updateMany({}, { isActive: false });
    }

    const newCampaign = await Campaign.create({
      subtitle: subtitle || "Campaign 2026",
      titleLine1,
      titleLine2: titleLine2 || "",
      description: description || "",
      image,
      buttonText: buttonText || "View Campaign",
      buttonLink: buttonLink || "/collections",
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign: newCampaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/campaign/update/:id - Admin only
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subtitle,
      titleLine1,
      titleLine2,
      description,
      image,
      buttonText,
      buttonLink,
      isActive,
    } = req.body;

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    if (isActive && !campaign.isActive) {
      // Deactivate all others so only this one is active
      await Campaign.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    campaign.subtitle = subtitle !== undefined ? subtitle : campaign.subtitle;
    campaign.titleLine1 = titleLine1 !== undefined ? titleLine1 : campaign.titleLine1;
    campaign.titleLine2 = titleLine2 !== undefined ? titleLine2 : campaign.titleLine2;
    campaign.description = description !== undefined ? description : campaign.description;
    campaign.image = image !== undefined ? image : campaign.image;
    campaign.buttonText = buttonText !== undefined ? buttonText : campaign.buttonText;
    campaign.buttonLink = buttonLink !== undefined ? buttonLink : campaign.buttonLink;
    if (isActive !== undefined) campaign.isActive = isActive;

    await campaign.save();

    return res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      campaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/campaign/delete/:id - Admin only
exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    // If the deleted one was active, activate the most recent one if exists
    if (campaign.isActive) {
      const latest = await Campaign.findOne().sort({ createdAt: -1 });
      if (latest) {
        latest.isActive = true;
        await latest.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
