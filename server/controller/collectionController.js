const Collection = require("../modal/Collection");

const defaultCollections = [
  {
    title: "Shadow Realm",
    subtitle: "SS 2026",
    description: "Where darkness meets elegance",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop",
    link: "/shop",
    isActive: true,
    order: 1,
  },
  {
    title: "Golden Hour",
    subtitle: "FW 2025",
    description: "Luxury bathed in warmth",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=600&fit=crop",
    link: "/shop",
    isActive: true,
    order: 2,
  },
];

exports.getActiveCollections = async (req, res) => {
  try {
    let collections = await Collection.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    
    // Auto-seed defaults if database is empty
    if (collections.length === 0) {
      await Collection.insertMany(defaultCollections);
      collections = await Collection.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    }
    
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCollections = async (req, res) => {
  try {
    let collections = await Collection.find().sort({ order: 1, createdAt: -1 });
    if (collections.length === 0) {
      await Collection.insertMany(defaultCollections);
      collections = await Collection.find().sort({ order: 1, createdAt: -1 });
    }
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCollection = async (req, res) => {
  try {
    const collection = new Collection(req.body);
    await collection.save();
    res.status(201).json(collection);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!collection) return res.status(404).json({ message: "Collection not found" });
    res.json(collection);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) return res.status(404).json({ message: "Collection not found" });
    res.json({ message: "Collection deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
