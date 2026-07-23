import express from "express";
import {
  userDeleteController,
  userDetailsController,
  userLoginController,
  userRegisterController,
  userUpdateController,
} from "../controllers/User.controller.js";
import { userAuthentication } from "../middleware/users.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", userRegisterController);
userRouter.post("/login", userLoginController);
userRouter.put("/update/:id", userAuthentication, userUpdateController);
userRouter.delete("/delete/:id", userAuthentication, userDeleteController);
userRouter.get("/details/:id", userAuthentication, userDetailsController);

export default userRouter;
