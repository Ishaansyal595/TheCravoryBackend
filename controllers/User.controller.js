import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import User from "../models/users.model.js";

export const userRegisterController = async (req, res) => {
  try {
    const { name, email, address, phone } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      address,
      phone,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const userLoginController = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (email && phone) {
      return res
        .status(400)
        .json({ message: "Please provide either email or phone" });
    }

    // Check if user exists
    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jsonwebtoken.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({ user: user, token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const userUpdateController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, address, phone },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const userDeleteController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const userDetailsController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const allUserController = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
