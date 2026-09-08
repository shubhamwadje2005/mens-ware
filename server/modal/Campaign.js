const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    subtitle: {
      type: String,
      default: "Campaign 2026",
      trim: true,
    },
    titleLine1: {
      type: String,
      default: "BEYOND",
      trim: true,
      required: true,
    },
    titleLine2: {
      type: String,
      default: "Ordinary",
      trim: true,
    },
    description: {
      type: String,
      default:
        "Where convention ends, creativity begins. Our latest campaign captures the essence of those who dare to stand apart.",
      trim: true,
    },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop",
      required: true,
    },
    buttonText: {
      type: String,
      default: "View Campaign",
      trim: true,
    },
    buttonLink: {
      type: String,
      default: "/collections",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
