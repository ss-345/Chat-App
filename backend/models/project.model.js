import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  fileTree: {
    type: Object,
    default: {},
  },
  messages: {
    type: [Object],
    default: [],
  },
});

const Project = mongoose.model("project", projectSchema);

export default Project;
