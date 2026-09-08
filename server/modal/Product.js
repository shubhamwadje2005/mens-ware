const mongoose = require("mongoose");

const imageItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ["upload", "url"], default: "url" },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    color: { type: String, required: true, trim: true },
    colorCode: { type: String, default: "#000000", trim: true },
    size: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    mrp: { type: Number, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: [mongoose.Schema.Types.Mixed],
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true }
);

const colorOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, default: "#000000", trim: true },
    images: [mongoose.Schema.Types.Mixed],
    skuCode: { type: String, trim: true },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    shortDescription: { type: String, trim: true },
    description: { type: String, trim: true },
    brand: { type: String, default: "NOIR STUDIO", trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    subcategory: { type: String, trim: true, index: true },
    productType: { type: String, default: "Apparel", trim: true },
    sku: { type: String, trim: true, index: true },
    tags: [{ type: String, trim: true }],
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Boys", "Girls", "Kids", ""],
      default: "Men",
    },
    status: {
      type: String,
      enum: ["Draft", "Active", "Inactive", "Out of Stock"],
      default: "Active",
      index: true,
    },

    // Base / Default Pricing
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },

    // Primary & Gallery Images
    image: { type: String, required: true },
    hoverImage: { type: String },
    images: [mongoose.Schema.Types.Mixed],

    // Color options (rich objects or string list)
    colorOptions: [colorOptionSchema],
    colors: [{ type: String }],

    // Available sizes
    sizes: [{ type: String }],

    // Combinations of (Color × Size)
    variants: [variantSchema],

    // Flexible Category-Based Attributes
    attributes: {
      fabric: { type: String, trim: true },
      fit: { type: String, trim: true },
      pattern: { type: String, trim: true },
      sleeve: { type: String, trim: true },
      collar: { type: String, trim: true },
      occasion: { type: String, trim: true },
      washCare: { type: String, trim: true },
      countryOfOrigin: { type: String, default: "India", trim: true },
      material: { type: String, trim: true },
      closure: { type: String, trim: true },
      customAttributes: { type: Map, of: String },
    },

    // Inventory
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },

    badge: { type: String, enum: ["NEW", "SALE", "PREMIUM", "LIMITED", null, ""] },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Auto calculate discount percentage & normalize images before save
productSchema.pre("save", function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  } else {
    this.discount = 0;
  }

  // Normalize images array
  if (Array.isArray(this.images) && this.images.length > 0) {
    let primaryImg = null;
    this.images = this.images.map((img, index) => {
      if (typeof img === "string") {
        return {
          url: img,
          type: img.startsWith("data:") ? "upload" : "url",
          isPrimary: index === 0,
          sortOrder: index,
        };
      } else if (img && typeof img === "object") {
        if (img.isPrimary) primaryImg = img.url;
        return {
          url: img.url,
          type: img.type || (img.url?.startsWith("data:") ? "upload" : "url"),
          isPrimary: Boolean(img.isPrimary),
          sortOrder: img.sortOrder !== undefined ? img.sortOrder : index,
        };
      }
      return img;
    });

    // Ensure at least one is marked isPrimary
    const hasPrimary = this.images.some((img) => img && img.isPrimary);
    if (!hasPrimary && this.images[0]) {
      this.images[0].isPrimary = true;
      primaryImg = this.images[0].url;
    }

    if (primaryImg) {
      this.image = primaryImg;
    } else if (this.images[0]?.url) {
      this.image = this.images[0].url;
    }
  }

  // Calculate variant discounts and total stock if variants exist
  if (this.variants && this.variants.length > 0) {
    let totalVariantStock = 0;
    this.variants.forEach((v) => {
      if (v.mrp && v.mrp > v.sellingPrice) {
        v.discount = Math.round(((v.mrp - v.sellingPrice) / v.mrp) * 100);
      } else {
        v.discount = 0;
      }
      totalVariantStock += Number(v.stock) || 0;
    });
    this.stock = totalVariantStock;
  }
});

module.exports = mongoose.model("Product", productSchema);
