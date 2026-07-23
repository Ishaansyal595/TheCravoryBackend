import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import userRouter from "./router/user.routes.js";
import adminRouter from "./router/admin.routes.js";
import connectDB from "./connectDB.js";
import productRouter from "./router/products.router.js";
import categoryRouter from "./router/category.router.js";
import path from "path";

const app = express();

connectDB();
console.log("API KEY:", process.env.CLOUDINARY_API_KEY);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
// app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = process.env.PORT || 5000;

app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message,
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
