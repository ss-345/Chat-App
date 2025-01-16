import userModel from "../models/user.model.js";
import * as userService from "../services/user.services.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.services.js";
export const createUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const user = await userService.createUser(req.body);
    const token = await user.generateJWT(user);
    delete user._doc.password;
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const loginController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).send({
        message: "Invalid credentials",
      });
    }
    const isValid = await user.isValidPassword(password);
    if (!isValid) {
      return res.status(401).send({
        message: "Invalid password",
      });
    }
    const token = user.generateJWT();
    delete user._doc.password;
    return res.status(201).json({ user, token });
  } catch (error) {
    // console.log(error);
    res.status(400).send(error.message);
  }
};

export const profileController = async (req, res) => {
  try {
    // console.log(req.user);
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    // console.log(error);
    res.status(400).send(error.message);
  }
};

export const logoutController = async (req, res) => {
  try {
    const token =
      req.cookies.token ||
      (req.headers.authorization &&
      req.headers.authorization.startsWith("bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    // console.log(token);
    redisClient.set(token, "logout", "EX", 60 * 60 * 24);

    return res.status(200).send({
      message: "Logout sucessfully",
    });
  } catch (error) {
    // console.log(error);
    res.status(400).send(error.message);
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const user = req.user;
    const loggedInUser = await userModel.findOne({ email: user.email });
    const userId = loggedInUser._id;
    const allUsers = await userService.getAllUsers({ userId });
    return res.status(200).json({ allUsers });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const authUserByToken = async (req, res) => {
  try {
    // const userId = req.user;
    // console.log(userId);
    const user = await userModel.findOne({email:req.user.email});

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log(user);
    return res.status(201).json({ user });
  } catch (error) {
    res.status(400).send(error);
  }
};
