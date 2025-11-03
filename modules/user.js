import mongoose from "mongoose";
import Counter from "./counter.js";

// User Data Structure
const userSchema = new mongoose.Schema({
  _id: { type: String },
  username: { type: String },
  password: { type: String },
});

// This runs before saving a new user
userSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "user_id" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const newId = `USR-${counter.value.toString().padStart(6, "0")}`;
    this._id = newId;
    next();
  } catch (err) {
    console.error("Error in generating ID:", err);
    next(err);
  }
});

const User = mongoose.model("Users", userSchema);
export default User;
