const mongoose = require("mongoose")

module.exports = mongoose.model("admin", new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    IsActive: { type: Boolean, default: true }
}, { timestamps: true }))