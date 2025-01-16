import projectModel from "../models/project.model.js";
import mongoose from "mongoose";
export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Name is required");
  }
  if (!userId) {
    throw new Error("User is required");
  }
  try {
    const existingProject = await projectModel.findOne({ name });
    if (existingProject) {
      throw new Error("Project with this name already exists.");
    }
    const project = await projectModel.create({
      name,
      users: [userId],
    });
    return project;
  } catch (error) {
    throw error;
  }
};
export const getAllProjectByUserId = async ({ userId }) => {
  if (!userId) {
    throw new Error("User is required");
  }
  const allProjects = await projectModel.find({
    users: userId,
  });

  return allProjects;
};

export const addUsersToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!users || !Array.isArray(users) || users.length === 0) {
    throw new Error("Users array is required and must not be empty");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid Project ID");
  }

  const invalidUsers = users.filter(
    (userId) => !mongoose.Types.ObjectId.isValid(userId)
  );
  if (invalidUsers.length > 0) {
    throw new Error("Invalid users ID element");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId ID");
  }

  try {
    const currProject = await projectModel.findOne({
      _id: projectId,
      users: userId,
    });
    if (!currProject) {
      throw new Error("Project is not found");
    }
    const updatedProject = await projectModel.findOneAndUpdate(
      { _id: projectId },
      { $addToSet: { users: { $each: users } } },
      { new: true, runValidators: true }
    );

    return updatedProject;
  } catch (error) {
    throw error;
  }
};

export const getProjectDetails = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid Project ID");
  }
  const projectDetail = await projectModel
    .findOne({
      _id: projectId,
    })
    .populate("users");
  return projectDetail;
};

export const updateFileTree = async ({ projectId, fileTree }) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid Project ID");
  }
  try {
    const updatedProject = await projectModel.findByIdAndUpdate(
      projectId,
      { $set: { fileTree } },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      throw new Error("Project not found");
    }

    return updatedProject;
  } catch (error) {
    console.error("Error updating fileTree:", error.message);
    throw new Error("Failed to update fileTree");
  }
};
export const updateMessage = async ({ projectId, messages }) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid Project ID");
  }
  try {
    const updatedProject = await projectModel.findByIdAndUpdate(
      projectId,
      { $set: { messages } },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      throw new Error("Project not found");
    }

    return updatedProject;
  } catch (error) {
    console.error("Error updating fileTree:", error.message);
    throw new Error("Failed to update fileTree");
  }
};
