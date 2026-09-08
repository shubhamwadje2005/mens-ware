const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    hoverImage: { type: String },
    badge: { type: String, enum: ["NEW", "SALE", "PREMIUM", "LIMITED", null, ""] },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    stock: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

