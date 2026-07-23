import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminRegisterController = async (req, res) => {
  try {
    console.log("This is the admin register function");
    const { name, email, password, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await User.findOne({ email });
    console.log("Existing Admin:", existingAdmin);

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);

    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully", newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminLoginController = async (req, res) => {
  try {
    console.log("This  is the admin function: ", req);
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const existingAdmin = await User.findOne({ email });
    console.log("Existing admin: ", existingAdmin);

    if (!existingAdmin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingAdmin.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const refreshToken = jwt.sign(
      { adminId: existingAdmin._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Set to false during local HTTP development
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: "/api/refresh-token",
    });

    const accessToken = jwt.sign(
      { adminId: existingAdmin._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    res.status(200).json({ admin: existingAdmin, token: accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminUpdateController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const updatedAdmin = await User.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true },
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDeleteController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAdmin = await User.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDetailsController = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id).populate("role", "admin");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ admin });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
