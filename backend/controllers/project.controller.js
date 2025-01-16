import projectModel from "../models/project.model.js";
import * as projectService from "../services/project.service.js";
import userModel from "../models/user.model.js";
import { validationResult } from "express-validator";

export const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).jason({
      errors: errors.array(),
    });
  }
  try {
    const { name } = req.body;
    const user = req.user;
    const loggedInUser = await userModel.findOne({ email: user.email });
    const userId = loggedInUser._id;
    const newProject = await projectService.createProject({ name, userId });
    return res.status(201).json(newProject);
  } catch (error) {
    // console.log(error);
    return res.status(400).send({ message: error.message });
  }
};

export const getAllProject = async (req, res) => {
  try {
    const user = req.user;
    const loggedInUser = await userModel.findOne({ email: user.email });
    const userId = loggedInUser._id;
    const allProjects = await projectService.getAllProjectByUserId({ userId });
    return res.status(201).json({
      projects: allProjects,
    });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

export const addUserToProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  try {
    const { projectId, users } = req.body;
    const user = req.user;
    const loggedInUser = await userModel.findOne({ email: user.email });
    const userId = loggedInUser._id;
    const updatedProject = await projectService.addUsersToProject({
      projectId,
      users,
      userId,
    });
    return res.status(201).json({ updatedProject: updatedProject });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectDetails = await projectService.getProjectDetails({
      projectId,
    });
    return res.status(201).json({ projectDetails });
  } catch (error) {
    // console.log(error);
    return res.status(400).send({ message: error.message });
  }
};
export const updateFileTree = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  try {
    const { projectId, fileTree } = req.body;
    const project = await projectService.updateFileTree({
      projectId,
      fileTree,
    });
    return res.status(200).json({ project });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};
export const updateMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  try {
    const { projectId, messages } = req.body;
    const project = await projectService.updateMessage({
      projectId,
      messages,
    });
    return res.status(200).json({ project });
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: error.message });
  }
};
