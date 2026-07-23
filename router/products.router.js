import express from "express";
import {
  addProductsController,
  deleteProductController,
  getAllProductsController,
  getProductDetailsController,
  getProductsByCategoryController,
  updateProductController,
} from "../controllers/products.controller.js";
import { userAuthentication } from "../middleware/users.middleware.js";
import { adminAuthentication } from "../middleware/admin.middleware.js";
import upload from "../multer.js";
const productRouter = express.Router();

productRouter.post(
  "/add-product",
  upload.array("images", 10),
  addProductsController,
);
productRouter.get("/all-products", getAllProductsController);
productRouter.get("/category/:slug", getProductsByCategoryController);
productRouter.get("/:id", getProductDetailsController);
productRouter.put("/:id", upload.array("images", 10), updateProductController);
productRouter.delete("/:id", deleteProductController);

export default productRouter;
