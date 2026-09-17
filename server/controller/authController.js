const User = require("../modal/User");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const Admin = require("../modal/Admin");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_KEY, { expiresIn: "7d" });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, avatar } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : "";
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone ? phone.trim() : "",
      avatar: avatar ? avatar.trim() : "",
    });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        role: user.role,
        addresses: user.addresses || [],
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : "";
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        role: user.role,
        addresses: user.addresses || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let user = await User.findById(userId).select("-password");
    if (!user) {
      const adminDoc = await Admin.findById(userId).select("-password");
      if (adminDoc) {
        user = { ...adminDoc.toObject(), role: "admin" };
      }
    }
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, avatar, password, removeAvatar } = req.body;
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only update name if non-empty string provided; never wipe existing name
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Only update phone if non-empty string provided; never wipe existing phone
    if (phone !== undefined && phone !== null && phone.trim() !== "") {
      user.phone = phone.trim();
    }

    // Update avatar if provided; preserve existing avatar unless explicit removeAvatar is requested
    if (removeAvatar === true) {
      user.avatar = "";
    } else if (avatar !== undefined && avatar !== null && avatar.trim() !== "") {
      user.avatar = avatar.trim();
    }

    if (email && email.trim() && email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email is already taken by another user" });
      }
      user.email = email.toLowerCase().trim();
    }

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      user.password = password;
    }

    await user.save();
    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.push(req.body);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });
    Object.assign(address, req.body);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.addressId
    );
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


//  admin login and logout

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }

    const result = await Admin.findOne({ email })
    if (!result) {
      return res.status(401).json({ message: "Invalid Credentials" })
    }

    if (!result.IsActive) {
      return res.status(401).json({ message: "Account Blocked By SuperAdmin" })
    }

    const verify = await bcryptjs.compare(password, result.password)
    if (!verify) {
      return res.status(401).json({ message: "Invalid Password" })
    }

    const isProduction = process.env.NODE_ENV === "production";
    const token = jwt.sign({ _id: result._id }, process.env.JWT_KEY || "secret");
    res.cookie("ADMIN", token, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    res.status(200).json({
      message: "Admin Login Success",
      token,
      result: {
        name: result.name,
        email: result.email,
        mobile: result.mobile,
        _id: result._id,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

exports.adminLogout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("ADMIN", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    res.status(200).json({ message: "Admin Logout Success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};