import express from "express";
import { userAuthentication } from "../middleware/users.middleware.js";
import {
  adminDeleteController,
  adminDetailsController,
  adminLoginController,
  adminRegisterController,
  adminUpdateController,
} from "../controllers/admin.controllers.js";
import { allUserController } from "../controllers/User.controller.js";
import { adminAuthentication } from "../middleware/admin.middleware.js";

const adminRouter = express.Router();

adminRouter.post("/register", adminRegisterController);
adminRouter.post("/login", adminLoginController);
adminRouter.put("/update/:id", adminAuthentication, adminUpdateController);
adminRouter.delete("/delete/:id", adminAuthentication, adminDeleteController);
adminRouter.get("/details/:id", adminAuthentication, adminDetailsController);
adminRouter.get("/users", adminAuthentication, allUserController);

adminRouter.post("/api/refresh-token", async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(401);

  const refreshToken = cookies?.refreshToken;

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); // Forbidden

    // Generate a new short-lived access token
    const accessToken = jwt.sign(
      { adminId: decoded.adminId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken });
  });
});

export default adminRouter;
