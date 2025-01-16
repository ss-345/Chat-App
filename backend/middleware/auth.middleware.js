import jwt from "jsonwebtoken";
import redisClient from "../services/redis.services.js";

export const authUser = async (req, res, next) => {
  try {
    // console.log(req);
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    // console.log(token);
    // console.log("Cookie Token:", req.cookies.token);
    // console.log("Authorization Header:", req.headers.authorization);

    if (!token) {
      return res.status(401).send({
        error: "Unauthorized user",
      });
    }
    const isBlacklisted = await redisClient.get(token);
    if (isBlacklisted) {
      res.cookie("token", "", { maxAge: 0 });
      return res.status(401).send({
        error: "Unauthorized user",
      });
    }

    const decodedVal = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decodedVal);
    req.user = decodedVal;
    next();
  } catch (error) {
    // console.log(error);
    return res.status(401).send({ error: "Unauthorized user" });
  }
};
