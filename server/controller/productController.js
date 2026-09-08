const Product = require("../modal/Product");

// Helper to generate a clean slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

exports.getAllProducts = async (req, res) => {
  try {
    const { category, subcategory, brand, gender, status, search, sort, minPrice, maxPrice } = req.query;
    let query = { isDeleted: { $ne: true } };

    if (category && category !== "All") query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = brand;
    if (gender) query.gender = gender;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortObj = {};
    if (sort === "price-low") sortObj.price = 1;
    else if (sort === "price-high") sortObj.price = -1;
    else if (sort === "newest") sortObj.createdAt = -1;
    else if (sort === "name") sortObj.name = 1;
    else sortObj.createdAt = -1;

    const products = await Product.find(query).sort(sortObj);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isDeleted: { $ne: true } });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    // Process & Normalize Images
    if (Array.isArray(data.images) && data.images.length > 0) {
      let primaryUrl = null;
      data.images = data.images.map((img, idx) => {
        if (typeof img === "string") {
          if (idx === 0 && !primaryUrl) primaryUrl = img;
          return {
            url: img.trim(),
            type: img.startsWith("data:") ? "upload" : "url",
            isPrimary: idx === 0,
            sortOrder: idx,
          };
        } else if (img && typeof img === "object") {
          if (img.isPrimary && !primaryUrl) primaryUrl = img.url;
          return {
            url: String(img.url || "").trim(),
            type: img.type || (String(img.url || "").startsWith("data:") ? "upload" : "url"),
            isPrimary: Boolean(img.isPrimary),
            sortOrder: img.sortOrder !== undefined ? img.sortOrder : idx,
          };
        }
        return img;
      }).filter((img) => img && img.url);

      if (!primaryUrl && data.images.length > 0) {
        data.images[0].isPrimary = true;
        primaryUrl = data.images[0].url;
      }
      if (primaryUrl) {
        data.image = primaryUrl;
      }
    } else if (data.image) {
      data.images = [
        {
          url: data.image.trim(),
          type: data.image.startsWith("data:") ? "upload" : "url",
          isPrimary: true,
          sortOrder: 0,
        },
      ];
    }

    // Validation
    if (!data.name || !data.category || data.price === undefined || !data.image) {
      return res.status(400).json({
        message: "Product name, category, price, and primary image are required.",
      });
    }

    // Number conversions
    data.price = Number(data.price);
    if (isNaN(data.price) || data.price < 0) {
      return res.status(400).json({ message: "Price must be a valid positive number." });
    }
    if (data.originalPrice) {
      data.originalPrice = Number(data.originalPrice);
    }

    // Generate unique slug
    let baseSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    if (!baseSlug) baseSlug = "product";
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await Product.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }
    data.slug = uniqueSlug;

    // Sanitize badge
    if (!data.badge || data.badge === "") {
      delete data.badge;
    }

    // Process and validate variants
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      const variantSet = new Set();
      let totalStock = 0;

      for (let i = 0; i < data.variants.length; i++) {
        const v = data.variants[i];
        if (!v.color || !v.size) {
          return res.status(400).json({
            message: `Variant at row ${i + 1} must have both color and size specified.`,
          });
        }

        const comboKey = `${v.color.toLowerCase().trim()}_${v.size.toLowerCase().trim()}`;
        if (variantSet.has(comboKey)) {
          return res.status(400).json({
            message: `Duplicate variant combination found: ${v.color} - ${v.size}. Each color and size combination must be unique.`,
          });
        }
        variantSet.add(comboKey);

        v.sellingPrice = Number(v.sellingPrice !== undefined ? v.sellingPrice : data.price);
        v.mrp = Number(v.mrp !== undefined ? v.mrp : data.originalPrice || data.price);
        v.stock = Number(v.stock !== undefined ? v.stock : 0);

        if (v.mrp && v.mrp > v.sellingPrice) {
          v.discount = Math.round(((v.mrp - v.sellingPrice) / v.mrp) * 100);
        } else {
          v.discount = 0;
        }

        totalStock += v.stock;
      }

      data.stock = totalStock;

      // Sync colors and sizes arrays for backwards compatibility
      if (!data.colors || data.colors.length === 0) {
        data.colors = Array.from(new Set(data.variants.map((v) => v.color)));
      }
      if (!data.sizes || data.sizes.length === 0) {
        data.sizes = Array.from(new Set(data.variants.map((v) => v.size)));
      }
    }

    // Sync colorOptions with colors list
    if (Array.isArray(data.colorOptions) && data.colorOptions.length > 0) {
      if (!data.colors || data.colors.length === 0) {
        data.colors = data.colorOptions.map((c) => c.name);
      }
    }

    const product = new Product(data);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    // Process & Normalize Images
    if (Array.isArray(data.images) && data.images.length > 0) {
      let primaryUrl = null;
      data.images = data.images.map((img, idx) => {
        if (typeof img === "string") {
          if (idx === 0 && !primaryUrl) primaryUrl = img;
          return {
            url: img.trim(),
            type: img.startsWith("data:") ? "upload" : "url",
            isPrimary: idx === 0,
            sortOrder: idx,
          };
        } else if (img && typeof img === "object") {
          if (img.isPrimary && !primaryUrl) primaryUrl = img.url;
          return {
            url: String(img.url || "").trim(),
            type: img.type || (String(img.url || "").startsWith("data:") ? "upload" : "url"),
            isPrimary: Boolean(img.isPrimary),
            sortOrder: img.sortOrder !== undefined ? img.sortOrder : idx,
          };
        }
        return img;
      }).filter((img) => img && img.url);

      if (!primaryUrl && data.images.length > 0) {
        data.images[0].isPrimary = true;
        primaryUrl = data.images[0].url;
      }
      if (primaryUrl) {
        data.image = primaryUrl;
      }
    }

    if (!data.badge || data.badge === "") {
      data.badge = null;
    }

    if (data.price !== undefined) {
      data.price = Number(data.price);
    }
    if (data.originalPrice !== undefined && data.originalPrice !== "") {
      data.originalPrice = Number(data.originalPrice);
    }

    // Process and validate variants if updated
    if (Array.isArray(data.variants)) {
      const variantSet = new Set();
      let totalStock = 0;

      for (let i = 0; i < data.variants.length; i++) {
        const v = data.variants[i];
        if (!v.color || !v.size) {
          return res.status(400).json({
            message: `Variant at row ${i + 1} must have both color and size specified.`,
          });
        }

        const comboKey = `${v.color.toLowerCase().trim()}_${v.size.toLowerCase().trim()}`;
        if (variantSet.has(comboKey)) {
          return res.status(400).json({
            message: `Duplicate variant combination found: ${v.color} - ${v.size}.`,
          });
        }
        variantSet.add(comboKey);

        v.sellingPrice = Number(v.sellingPrice !== undefined ? v.sellingPrice : data.price);
        v.mrp = Number(v.mrp !== undefined ? v.mrp : data.originalPrice || data.price);
        v.stock = Number(v.stock !== undefined ? v.stock : 0);

        if (v.mrp && v.mrp > v.sellingPrice) {
          v.discount = Math.round(((v.mrp - v.sellingPrice) / v.mrp) * 100);
        } else {
          v.discount = 0;
        }

        totalStock += v.stock;
      }

      data.stock = totalStock;

      // Sync colors and sizes arrays
      data.colors = Array.from(new Set(data.variants.map((v) => v.color)));
      data.sizes = Array.from(new Set(data.variants.map((v) => v.size)));
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, isActive: false, deletedAt: new Date() },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product soft-deleted", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.restoreProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, isActive: true, deletedAt: null },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product restored", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const newStatus =
      req.body.isAvailable !== undefined
        ? Boolean(req.body.isAvailable)
        : product.isAvailable === false
        ? true
        : false;

    product.isAvailable = newStatus;
    await product.save();

    res.json({
      message: `Product is now marked as ${newStatus ? "Available" : "Not Available"}`,
      product,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true, isDeleted: { $ne: true } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
