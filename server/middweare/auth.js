const jwt = require("jsonwebtoken");
const User = require("../modal/User");
const Admin = require("../modal/Admin");

const getSecretKey = () => {
  const secret = process.env.JWT_KEY || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET or JWT_KEY environment variable is not set.");
    }
    return "dev_fallback_key_strictly_for_local_testing_change_in_production";
  }
  return secret;
};

const auth = async (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.ADMIN;

    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    const decoded = jwt.verify(token, getSecretKey());
    const userId = decoded.id || decoded._id;

    let user = await User.findById(userId).select("-password");
    if (!user) {
      const adminDoc = await Admin.findById(userId).select("-password");
      if (adminDoc) {
        user = { ...adminDoc.toObject(), role: "admin", IsActive: adminDoc.IsActive };
      }
    }

    if (!user) return res.status(401).json({ message: "Token is not valid" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.ADMIN;

    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    const decoded = jwt.verify(token, getSecretKey());
    const userId = decoded.id || decoded._id;

    let user = await User.findById(userId).select("-password");
    if (!user) {
      const adminDoc = await Admin.findById(userId).select("-password");
      if (adminDoc) {
        user = { ...adminDoc.toObject(), role: "admin", IsActive: adminDoc.IsActive };
      }
    }

    if (!user) return res.status(401).json({ message: "Token is not valid" });

    // SEC-004 Fix: Check administrative authorization strictly via role and active status, avoiding hardcoded emails
    const isAuthorizedAdmin = user.role === "admin" && user.IsActive !== false;

    if (!isAuthorizedAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { auth, adminAuth };

