const jwt = require("jsonwebtoken");
const User = require("../modal/User");
const Admin = require("../modal/Admin");

const getSecretKey = () => process.env.JWT_KEY || process.env.JWT_SECRET || "secret";

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
        user = { ...adminDoc.toObject(), role: "admin" };
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

    const isAuthorizedAdmin =
      user.role === "admin" ||
      user.IsActive === true ||
      user.email === "admin@noirstudio.com" ||
      user.email === "shubhamwadje2005@gmail.com";

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

