const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: "Our Story",
      trim: true,
    },
    heroSubtitle: {
      type: String,
      default:
        "Born from a belief that clothing should be an extension of one's identity, not a costume.",
      trim: true,
    },
    heroImage: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop",
      trim: true,
    },
    stats: [
      {
        value: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
    storyBadge: {
      type: String,
      default: "The Beginning",
      trim: true,
    },
    storyHeading: {
      type: String,
      default: "Redefining Modern Luxury",
      trim: true,
    },
    storyParagraphs: [
      {
        type: String,
        trim: true,
      },
    ],
    storyImage: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop",
      trim: true,
    },
    storyEstYear: {
      type: String,
      default: "Est. 2020",
      trim: true,
    },
    storyLocation: {
      type: String,
      default: "London, United Kingdom",
      trim: true,
    },
    valuesHeading: {
      type: String,
      default: "What We Stand For",
      trim: true,
    },
    values: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, default: "✦" },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("About", aboutSchema);
