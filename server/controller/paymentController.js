const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../modal/Order");

if (
  !process.env.RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET
) {
  throw new Error(
    "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required"
  );
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

exports.createOrder = async (req, res) => {
  try {
    const {
      amount,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    // ---------------------------------------------
    // Validate amount
    // ---------------------------------------------

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    // ---------------------------------------------
    // Convert INR to paise
    // ₹500 = 50000 paise
    // ---------------------------------------------

    const amountInPaise = Math.round(
      numericAmount * 100
    );

    // ---------------------------------------------
    // Create Razorpay order
    // ---------------------------------------------

    const options = {
      amount: amountInPaise,
      currency: "INR",

      receipt: `receipt_${Date.now()}`,

      notes: {
        customerName: customerName || "",
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || "",
      },
    };

    const order =
      await razorpay.orders.create(options);

    console.log(
      "Razorpay Order Created:",
      order.id
    );

    return res.status(200).json({
      success: true,

      message:
        "Razorpay order created successfully",

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.error(
      "CREATE RAZORPAY ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to create Razorpay order",

      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.error?.description || error.message || error,
    });
  }
};

// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ---------------------------------------------
    // Validate response
    // ---------------------------------------------

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay payment details are missing",
      });
    }

    // ---------------------------------------------
    // Generate signature
    // ---------------------------------------------

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest("hex");

    // ---------------------------------------------
    // Timing safe comparison
    // ---------------------------------------------

    const expectedBuffer =
      Buffer.from(expectedSignature);

    const receivedBuffer =
      Buffer.from(razorpay_signature);

    const isValid =
      expectedBuffer.length ===
      receivedBuffer.length &&
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    // ---------------------------------------------
    // Invalid signature
    // ---------------------------------------------

    if (!isValid) {
      console.log(
        "Invalid Razorpay signature"
      );

      return res.status(400).json({
        success: false,
        message:
          "Invalid Razorpay payment signature",
      });
    }

    // ---------------------------------------------
    // PAYMENT VERIFIED
    // ---------------------------------------------

    console.log(
      "Razorpay Payment Verified:",
      razorpay_payment_id
    );

    let updatedOrder = null;
    try {
      const orderQuery = {
        $or: [
          { paymentId: razorpay_order_id },
          { paymentId: razorpay_payment_id },
        ],
      };
      if (req.body.orderId && mongoose.Types.ObjectId.isValid(req.body.orderId)) {
        orderQuery.$or.push({ _id: req.body.orderId });
      }
      if (req.body.dbOrderId && mongoose.Types.ObjectId.isValid(req.body.dbOrderId)) {
        orderQuery.$or.push({ _id: req.body.dbOrderId });
      }

      updatedOrder = await Order.findOneAndUpdate(
        orderQuery,
        {
          paymentStatus: "paid",
          paymentId: razorpay_payment_id,
          status: "confirmed",
        },
        { new: true }
      );
    } catch (dbErr) {
      console.error("Order update failed after verification:", dbErr);
    }

    return res.status(200).json({
      success: true,
      message: "Razorpay payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "VERIFY RAZORPAY PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Payment verification failed",

      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.error?.description || error.message || error,
    });
  }
};