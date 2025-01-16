import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connect = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Database connected here sucessfully");
    })
    .catch((err) => {
      console.log(err);
    });
};

export default connect;
