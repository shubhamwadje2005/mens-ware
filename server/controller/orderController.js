const Order = require("../modal/Order");
const Product = require("../modal/Product");

exports.createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, paymentStatus, paymentId } = req.body;

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const productId = typeof item.product === "object" ? (item.product._id || item.product.id) : item.product;
      const product = await Product.findById(productId);

      const prodName = item.name || product?.name || (typeof item.product === "object" ? item.product.name : "Product");
      const prodImg = item.image || product?.image || (typeof item.product === "object" ? item.product.image : "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop");
      const prodSlug = item.slug || product?.slug || (typeof item.product === "object" ? item.product.slug : undefined);
      const prodPrice = item.price || product?.price || 0;

      total += prodPrice * item.quantity;
      orderItems.push({
        product: product ? product._id : (mongoose.Types.ObjectId.isValid(productId) ? productId : undefined),
        name: prodName,
        image: prodImg,
        slug: prodSlug,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        price: prodPrice,
      });
    }

    const isOnline = paymentMethod === "Online Payment" || paymentMethod === "online" || paymentMethod === "Razorpay";
    const methodString = isOnline ? "Online Payment" : "Cash on Delivery";
    const statusString = paymentStatus || (isOnline ? "paid" : "pending");

    const order = new Order({
      user: req.user.id,
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
    res.status(400).json({ message: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id, isDeleted: { $ne: true } })
      .populate("items.product", "name image slug")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
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
