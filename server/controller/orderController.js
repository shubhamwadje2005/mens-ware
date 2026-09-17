const mongoose = require("mongoose");
const Order = require("../modal/Order");
const Product = require("../modal/Product");

exports.createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, paymentStatus, paymentId } = req.body;

    let total = 0;
    const orderItems = [];

    for (const item of items) {
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

      const rawImg = item.image || product?.image || (typeof item.product === "object" ? item.product.image : null);
      const prodImg = (typeof rawImg === "object" && rawImg !== null ? rawImg.url : rawImg) || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop";
      const prodSlug = item.slug || product?.slug || (typeof item.product === "object" ? item.product.slug : undefined);
      const prodPrice = Number(item.price !== undefined ? item.price : product?.price) || 0;
      const prodName = item.name || product?.name || (typeof item.product === "object" ? item.product.name : "Product");
      const selectedSize = item.selectedSize || item.size || "";
      const selectedColor = item.selectedColor || item.color || "";
      const colorCode = item.colorCode || "";

      total += prodPrice * item.quantity;
      orderItems.push({
        product: product ? product._id : (mongoose.Types.ObjectId.isValid(rawProductId) ? rawProductId : undefined),
        variantId: item.variantId,
        sku: item.sku,
        colorCode,
        name: prodName,
        image: prodImg,
        slug: prodSlug,
        quantity: item.quantity,
        selectedSize,
        selectedColor,
        price: prodPrice,
      });

      // Deduct inventory from variant and product if available
      if (product) {
        if (Array.isArray(product.variants) && product.variants.length > 0) {
          const vIndex = product.variants.findIndex(
            (v) =>
              (item.variantId && v._id?.toString() === item.variantId) ||
              (v.color?.toLowerCase() === selectedColor.toLowerCase() &&
               v.size?.toLowerCase() === selectedSize.toLowerCase())
          );
          if (vIndex !== -1) {
            product.variants[vIndex].stock = Math.max(0, (product.variants[vIndex].stock || 0) - item.quantity);
          }
        }
        if (typeof product.stock === "number") {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
        await product.save();
      }
    }

    const isOnline = paymentMethod === "Online Payment" || paymentMethod === "online" || paymentMethod === "Razorpay";
    const methodString = isOnline ? "Online Payment" : "Cash on Delivery";
    const statusString = paymentStatus || (isOnline ? "paid" : "pending");
    const userId = req.user?._id || req.user?.id || undefined;

    const order = new Order({
      user: userId,
      items: orderItems,
      total,
      address,
      paymentMethod: methodString,
      paymentStatus: statusString,
      paymentId: paymentId || (isOnline ? `pay_${Date.now()}` : undefined),
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
