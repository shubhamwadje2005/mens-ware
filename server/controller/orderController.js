const mongoose = require("mongoose");
const Order = require("../modal/Order");
const Product = require("../modal/Product");

exports.createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, paymentId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }

    if (!address || !address.name || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({ message: "Complete shipping address is required." });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const rawProductId = typeof item.product === "object" ? (item.product._id || item.product.id) : item.product;
      let product = null;

      if (rawProductId) {
        if (mongoose.Types.ObjectId.isValid(rawProductId)) {
          product = await Product.findById(rawProductId);
        }
        if (!product) {
          product = await Product.findOne({ slug: rawProductId });
        }
      }

      if (!product) {
        return res.status(400).json({ message: `Product not found or unavailable: ${item.name || rawProductId}` });
      }

      // SEC-002 Fix: Strictly derive price from genuine database product & variant records
      let prodPrice = Number(product.price) || 0;
      let selectedVariant = null;

      if (item.variantId && Array.isArray(product.variants)) {
        selectedVariant = product.variants.find((v) => v._id?.toString() === item.variantId);
        if (selectedVariant && typeof selectedVariant.sellingPrice === "number") {
          prodPrice = selectedVariant.sellingPrice;
        }
      } else if (item.selectedSize && item.selectedColor && Array.isArray(product.variants)) {
        selectedVariant = product.variants.find(
          (v) =>
            v.color?.toLowerCase() === item.selectedColor.toLowerCase() &&
            v.size?.toLowerCase() === item.selectedSize.toLowerCase()
        );
        if (selectedVariant && typeof selectedVariant.sellingPrice === "number") {
          prodPrice = selectedVariant.sellingPrice;
        }
      }

      const rawImg = selectedVariant?.images?.[0] || product.image || item.image;
      const prodImg = (typeof rawImg === "object" && rawImg !== null ? rawImg.url : rawImg) || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop";
      const selectedSize = item.selectedSize || item.size || selectedVariant?.size || "";
      const selectedColor = item.selectedColor || item.color || selectedVariant?.color || "";
      const colorCode = item.colorCode || selectedVariant?.colorCode || "";

      total += prodPrice * quantity;
      orderItems.push({
        product: product._id,
        variantId: selectedVariant?._id?.toString() || item.variantId,
        sku: selectedVariant?.sku || item.sku || product.sku,
        colorCode,
        name: product.name,
        image: prodImg,
        slug: product.slug,
        quantity,
        selectedSize,
        selectedColor,
        price: prodPrice,
      });

      // Deduct inventory safely
      if (selectedVariant) {
        selectedVariant.stock = Math.max(0, (selectedVariant.stock || 0) - quantity);
      }
      if (typeof product.stock === "number") {
        product.stock = Math.max(0, product.stock - quantity);
      }
      await product.save();
    }

    const isOnline = paymentMethod === "Online Payment" || paymentMethod === "online" || paymentMethod === "Razorpay";
    const methodString = isOnline ? "Online Payment" : "Cash on Delivery";
    // SEC-003 Fix: Online orders start as 'pending' until verified via Razorpay webhook/signature verification
    const statusString = "pending";
    const userId = req.user?._id || req.user?.id || undefined;

    const order = new Order({
      user: userId,
      items: orderItems,
      total,
      address: {
        name: address.name.trim(),
        phone: address.phone.trim(),
        addressLine1: address.addressLine1.trim(),
        addressLine2: address.addressLine2 ? address.addressLine2.trim() : "",
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
      },
      paymentMethod: methodString,
      paymentStatus: statusString,
      paymentId: paymentId || (isOnline ? undefined : undefined),
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const userEmail = req.user?.email;
    const orConditions = [];
    if (userId) orConditions.push({ user: userId });
    if (userEmail) orConditions.push({ "address.email": userEmail });

    if (orConditions.length === 0) {
      return res.json([]);
    }

    const orders = await Order.find({
      $or: orConditions,
      isDeleted: { $ne: true },
    })
      .populate("items.product", "name image slug")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Order not found" });
    }
    const order = await Order.findById(req.params.id).populate(
      "items.product",
      "name image slug price"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    // SEC-001 Fix: IDOR / BOLA Prevention - verify user owns order or is an authorized admin
    const currentUserId = req.user ? (req.user._id || req.user.id).toString() : null;
    const orderUserId = order.user ? (order.user._id || order.user).toString() : null;
    const isAdmin = req.user && req.user.role === "admin";

    if (!isAdmin && (!orderUserId || orderUserId !== currentUserId)) {
      return res.status(403).json({ message: "Access denied. You do not have permission to view this order." });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ isDeleted: { $ne: true } })
      .populate("user", "name email")
      .populate("items.product", "name image price slug category")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ isDeleted: true })
      .populate("user", "name email")
      .populate("items.product", "name image price slug category")
      .sort({ deletedAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    if (status === "delivered") {
      updateData.paymentStatus = "paid";
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order soft-deleted", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.restoreOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order restored", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
