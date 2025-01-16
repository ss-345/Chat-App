import express, { urlencoded } from "express";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.route.js";
import aiRoutes from "./routes/ai.route.js";
import cookieParser from "cookie-parser";
import connect from "./db/db.js";
import cors from "cors";
connect();

const app = express();
const corsOptions = {
  origin: " http://localhost:5173",
};

// app.options("*", cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
