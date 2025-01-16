import dotenv from "dotenv";
dotenv.config();
import app from "./index.js";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import ProjectModel from "./models/project.model.js";
import { generateResult } from "./services/ai.service.js";
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
const PORT = process.env.PORT || 8000;

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];
    const projectId = socket.handshake.query.projectId;
    if (!token) {
      return next(new Error("Authentication token is required"));
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectid"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error("Authentication error"));
    }
    socket.user = decoded;
    socket.project = await ProjectModel.findById({ _id: projectId });
    // console.log(socket.user);
    // console.log(socket.project);
    next();
  } catch (err) {
    next(err);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();
  console.log("a new user connected");
  socket.join(socket.roomId);
  socket.on("project-message", async (data) => {
    const inputMessage = data.inputMessage;
    const isMessageIncludesAi = inputMessage.includes("@ai");
    socket.broadcast.to(socket.roomId).emit("project-message", data);
    if (isMessageIncludesAi) {
      const prompt = inputMessage.replace("@ai", "");
      const result = await generateResult(prompt);
      io.to(socket.roomId).emit("project-message", {
        sender: {
          _id: "ai",
          email: "AI",
        },
        inputMessage: result,
      });
      return;
    }
  });
  socket.on("event", (data) => {
    /* … */
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.leave(socket.roomId);
  });
});

server.listen(PORT, () => {
  console.log(`${PORT} listen here sucessfully`);
});
