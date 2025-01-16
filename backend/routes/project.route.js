import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { authUser } from "../middleware/auth.middleware.js";
import { body } from "express-validator";
const router = Router();

router.post(
  "/create",
  body("name").isString().withMessage("Name should be an string"),
  authUser,
  projectController.createProject
);

router.get("/all", authUser, projectController.getAllProject);

router.put(
  "/add-user",
  authUser,
  body("projectId").isString().withMessage("Project Id should be an string"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user mustbe a string"),
  projectController.addUserToProject
);
router.get(
  "/get-project/:projectId",
  authUser,
  projectController.getProjectById
);

router.put(
  "/update-file-tree",
  authUser,
  body("projectId").isString().withMessage("Project id is required"),
  body("fileTree").isObject().withMessage("File Tree is required"),
  projectController.updateFileTree
);

router.put(
  "/update-messages",
  authUser,
  body("projectId").isString().withMessage("Project id is required"),
  body("messages").isArray().withMessage("Messages are required"),
  projectController.updateMessage
);
export default router;
