import Product from "../models/products.model.js";
import Category from "../models/category.model.js";
import ProductVariant from "../models/productVariants.model.js";
import { uploadImage } from "../helper.js";

export const addProductsController = async (req, res) => {
  try {
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedImage = await uploadImage(file.buffer, "products");

        imageUrls.push(uploadedImage.secure_url);
      }
    }

    const {
      name,
      description,
      slug,
      shortDescription,
      categoryName,
      categoryImage,
      categoryDescription,
      categorySlug,
      size,
      weight,
      price,
      stock,
      isFeatured,
      isBestSeller,
      isNewArrival,
    } = req.body;

    // Validation
    if (
      !name ||
      !description ||
      !slug ||
      !shortDescription ||
      !categoryName ||
      !categorySlug ||
      imageUrls.length === 0 ||
      !size ||
      !weight ||
      !price ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Check if product already exists
    const existingProduct = await Product.findOne({ slug });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with this slug already exists.",
      });
    }

    // Check if category exists
    let category = await Category.findOne({ slug: categorySlug });

    // Create category if it doesn't exist
    if (!category) {
      category = await Category.create({
        name: categoryName,
        description: categoryDescription,
        slug: categorySlug,
        image: categoryImage,
      });
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      slug,
      shortDescription,
      category: category._id,
      images: imageUrls,
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: Boolean(isNewArrival),
    });

    // Create product variant
    const productVariant = await ProductVariant.create({
      productId: product._id,
      size,
      weight,
      price: Number(price),
      stock: Number(stock),
    });

    // Update product with variant id
    product.productVariant = productVariant._id;
    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product,
      category,
      productVariant,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("productVariant");

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      products,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductDetailsController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("category")
      .populate("productVariant");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product details retrieved successfully.",
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      slug,
      shortDescription,
      categoryName,
      categoryDescription,
      categorySlug,
      size,
      weight,
      price,
      stock,
      isFeatured,
      isBestSeller,
      isNewArrival,
    } = req.body;

    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedImage = await uploadImage(file.buffer, "products");

        imageUrls.push(uploadedImage.secure_url);
      }
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Update category if needed
    let category = await Category.findOne({ slug: categorySlug });

    if (!category) {
      category = await Category.create({
        name: categoryName,
        description: categoryDescription,
        slug: categorySlug,
      });
    }

    // Update product
    product.name = name;
    product.description = description;
    product.slug = slug;
    product.shortDescription = shortDescription;
    product.category = category._id;
    product.images = imageUrls;
    product.isFeatured = Boolean(isFeatured);
    product.isBestSeller = Boolean(isBestSeller);
    product.isNewArrival = Boolean(isNewArrival);

    await product.save();

    // Update variant
    await ProductVariant.findByIdAndUpdate(product.productVariant, {
      size,
      weight,
      price,
      stock,
    });

    const updatedProduct = await Product.findById(id)
      .populate("category")
      .populate("productVariant");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await ProductVariant.findByIdAndDelete(product.productVariant);
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductsByCategoryController = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const products = await Product.find({ category: category._id })
      .populate("category")
      .populate("productVariant");

    return res.status(200).json({
      success: true,
      message: "Products by category retrieved successfully.",
      products,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
