import mongoose from "mongoose";
import Counter from "./counter.js";

// User Data Structure
const userSchema = new mongoose.Schema({
  _id: { type: String },
  username: { type: String },
  password: { type: String },
  role: { 
    type: String, 
    enum: ["owner", "user","admin"], 
    default: "user"
  },
  email: { type: String },
  favorites: { type: Array, default: [] },
  bookings: { type: Array, default: [] },
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

//this function check if user owner or not
userSchema.methods.isOwner = function () {
  return this.role === 'owner';
};


const User = mongoose.model("Users", userSchema);
export default User;
