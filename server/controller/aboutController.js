const About = require("../modal/About");

// Default initial about data
const defaultAboutData = {
  heroTitle: "Our Story",
  heroSubtitle:
    "Born from a belief that clothing should be an extension of one's identity, not a costume.",
  heroImage:
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop",
  stats: [
    { value: "50K+", label: "Happy Customers" },
    { value: "200+", label: "Premium Products" },
    { value: "30+", label: "Countries Served" },
    { value: "99%", label: "Satisfaction Rate" },
  ],
  storyBadge: "The Beginning",
  storyHeading: "Redefining Modern Luxury",
  storyParagraphs: [
    "NOIR—STUDIO was founded on a singular conviction: that true luxury is not about logos or labels, but about the quiet confidence that comes from wearing something exquisitely made.",
    "We draw inspiration from the intersection of architecture, art, and the human form. Each piece in our collection is designed to move with you, adapt to you, and ultimately become a part of you.",
    "Our commitment extends beyond aesthetics. We work exclusively with mills and workshops that share our values — where artisanal craftsmanship meets progressive sustainability practices.",
  ],
  storyImage:
    "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop",
  storyEstYear: "Est. 2020",
  storyLocation: "London, United Kingdom",
  valuesHeading: "What We Stand For",
  values: [
    {
      title: "Craftsmanship",
      description: "Every stitch, every seam, every detail is meticulously considered and expertly executed.",
      icon: "✦",
    },
    {
      title: "Sustainability",
      description: "We believe luxury and responsibility can coexist. Our materials are ethically sourced.",
      icon: "◈",
    },
    {
      title: "Innovation",
      description: "Pushing boundaries while respecting tradition. We evolve without compromising our essence.",
      icon: "⬡",
    },
    {
      title: "Community",
      description: "More than a brand — a collective of individuals who share a vision for elevated living.",
      icon: "△",
    },
  ],
  isActive: true,
};

// GET /api/about - Public (returns active About data or seeds if empty)
exports.getAbout = async (req, res) => {
  try {
    let about = await About.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (!about) {
      const count = await About.countDocuments();
      if (count === 0) {
        about = await About.create(defaultAboutData);
      } else {
        about = await About.findOne().sort({ updatedAt: -1 });
      }
    }
    return res.status(200).json({ success: true, about: about || null });
  } catch (error) {
    console.error("Error fetching about data:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// GET /api/about/admin - Admin only (returns the latest about document or seeds if empty)
exports.getAboutAdmin = async (req, res) => {
  try {
    let about = await About.findOne().sort({ updatedAt: -1 });
    if (!about) {
      const count = await About.countDocuments();
      if (count === 0) {
        about = await About.create(defaultAboutData);
      }
    }
    return res.status(200).json({ success: true, about: about || null });
  } catch (error) {
    console.error("Error fetching about for admin:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// POST or PUT /api/about - Admin only (create or update about data)
exports.saveAbout = async (req, res) => {
  try {
    const {
      heroTitle,
      heroSubtitle,
      heroImage,
      stats,
      storyBadge,
      storyHeading,
      storyParagraphs,
      storyImage,
      storyEstYear,
      storyLocation,
      valuesHeading,
      values,
      isActive,
    } = req.body;

    let about = await About.findOne().sort({ updatedAt: -1 });

    if (about) {
      if (heroTitle !== undefined) about.heroTitle = heroTitle;
      if (heroSubtitle !== undefined) about.heroSubtitle = heroSubtitle;
      if (heroImage !== undefined) about.heroImage = heroImage;
      if (stats !== undefined) about.stats = stats;
      if (storyBadge !== undefined) about.storyBadge = storyBadge;
      if (storyHeading !== undefined) about.storyHeading = storyHeading;
      if (storyParagraphs !== undefined) about.storyParagraphs = storyParagraphs;
      if (storyImage !== undefined) about.storyImage = storyImage;
      if (storyEstYear !== undefined) about.storyEstYear = storyEstYear;
      if (storyLocation !== undefined) about.storyLocation = storyLocation;
      if (valuesHeading !== undefined) about.valuesHeading = valuesHeading;
      if (values !== undefined) about.values = values;
      if (isActive !== undefined) about.isActive = isActive;

      await about.save();

      return res.status(200).json({
        success: true,
        message: "About page content updated successfully",
        about,
      });
    } else {
      about = await About.create({
        heroTitle: heroTitle || "Our Story",
        heroSubtitle:
          heroSubtitle ||
          "Born from a belief that clothing should be an extension of one's identity, not a costume.",
        heroImage:
          heroImage ||
          "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop",
        stats: stats || [],
        storyBadge: storyBadge || "The Beginning",
        storyHeading: storyHeading || "Redefining Modern Luxury",
        storyParagraphs: storyParagraphs || [],
        storyImage:
          storyImage ||
          "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop",
        storyEstYear: storyEstYear || "Est. 2020",
        storyLocation: storyLocation || "London, United Kingdom",
        valuesHeading: valuesHeading || "What We Stand For",
        values: values || [],
        isActive: isActive !== undefined ? isActive : true,
      });

      return res.status(201).json({
        success: true,
        message: "About page content created successfully",
        about,
      });
    }
  } catch (error) {
    console.error("Error saving about data:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
