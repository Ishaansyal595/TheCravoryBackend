import jwt from "jsonwebtoken";
import User from "../models/users.model.js";

export const adminAuthentication = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token:", token);

  try {
    console.log(
      `Verifying token with secret: ${process.env.JWT_SECRET} and ${token}`,
    );
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    const findAdmin = await User.findById(decoded.adminId);
    if (!findAdmin || findAdmin.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    req.admin = findAdmin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
