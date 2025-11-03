import mongoose from "mongoose";

// User Data Structure
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

const Counter = mongoose.model("counter", counterSchema);

export default Counter;
