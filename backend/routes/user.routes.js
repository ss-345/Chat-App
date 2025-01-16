import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import * as authMiddleware from "../middleware/auth.middleware.js";
import { body } from "express-validator";
const router = Router();

router.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast of six charcters"),
  userController.createUserController
);
router.post(
  "/login",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast of six charcters"),
  userController.loginController
);

router.get(
  "/profile",
  authMiddleware.authUser,
  userController.profileController
);

router.get("/auth", authMiddleware.authUser, userController.authUserByToken);

router.get("/logout", authMiddleware.authUser, userController.logoutController);

router.get("/all", authMiddleware.authUser, userController.getAllUsers);
export default router;
