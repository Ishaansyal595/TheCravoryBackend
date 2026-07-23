import { uploadImage } from "../helper.js";
import Category from "../models/category.model.js";
import Product from "../models/products.model.js";
import ProductVariant from "../models/productVariants.model.js";

export const createCategoryController = async (req, res) => {
  try {
    const { name, description, slug } = req.body;

    if (!name || !description || !slug) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const uploadedImage = await uploadImage(req.file.buffer);

    const newCategory = new Category({
      name,
      description,
      slug,
      image: {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      },
    });

    await newCategory.save();
    console.log("New category: ", newCategory);
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error(error);
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    if (!categories) {
      res.status(401).json({ message: "Categories not found!" });
    }

    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    console.log("Update category: ", req.params);
    const { slug: currentSlug } = req.params;
    const { name, description, slug } = req.body;

    const category = await Category.findOne({ slug: currentSlug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    let image = category.image;
    if (req.file) {
      // Delete old image
      if (category.image?.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
      }

      // Upload new image
      const uploadedImage = await uploadImage(req.file.buffer);

      image = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    const update = await Category.findOneAndUpdate(
      { slug: currentSlug },
      { name, description, slug },
      { new: true },
    );

    if (!update) {
      res.status(400).json({ success: false, message: "Category not found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: update,
    });
  } catch (error) {}
};

export const getDetailedCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    if (!category) {
      res.status(401).json({ message: `Category ${slug} not found!` });
    }

    res
      .status(200)
      .json({ message: "Category Fetched Successfully!", category });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const products = await Product.find({ category: category._id });
    const productIds = products.map((product) => product._id);

    if (productIds.length > 0) {
      await ProductVariant.deleteMany({ productId: { $in: productIds } });
      await Product.deleteMany({ category: category._id });
    }

    await Category.deleteOne({ _id: category._id });

    return res.status(200).json({
      success: true,
      message: "Category and related products deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
