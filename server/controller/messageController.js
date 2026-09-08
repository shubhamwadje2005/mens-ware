const Message = require("../modal/Message");

// POST /api/messages - Public (Send a message from Contact Us form)
exports.createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields",
      });
    }

    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject ? subject.trim() : "General Inquiry",
      message: message.trim(),
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully! We'll get back to you soon.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: error.message,
    });
  }
};

// GET /api/messages - Admin only (Get all messages)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    const unreadCount = await Message.countDocuments({ isRead: false });

    return res.status(200).json({
      success: true,
      messages,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// PATCH /api/messages/:id/read - Admin only (Mark message as read/unread)
exports.toggleReadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    const msg = await Message.findById(id);
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    msg.isRead = isRead !== undefined ? isRead : !msg.isRead;
    await msg.save();

    return res.status(200).json({
      success: true,
      message: msg.isRead ? "Marked as read" : "Marked as unread",
      data: msg,
    });
  } catch (error) {
    console.error("Error toggling message status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE /api/messages/:id - Admin only (Delete a message)
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await Message.findByIdAndDelete(id);

    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
