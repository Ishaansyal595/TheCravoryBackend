import express from "express";
import {
  createCategoryController,
  deleteCategory,
  getAllCategories,
  getDetailedCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import upload from "../multer.js";

const categoryRouter = express.Router();

categoryRouter.post(
  "/create-category",
  upload.single("image"),
  createCategoryController,
);
categoryRouter.get("/", getAllCategories);
categoryRouter.put("/:slug", upload.single("image"), updateCategory);
categoryRouter.get("/:slug", getDetailedCategory);
categoryRouter.delete("/:slug", deleteCategory);

export default categoryRouter;
