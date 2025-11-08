import mongoose from "mongoose";
import Counter from "./counter.js";

const bookingsSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: String },
  courtId: { type: String },
  bookingDate: { type: Date },
  times: { type: [] },
});

userSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "booking_id" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const newId = `BK-${counter.value.toString().padStart(6, "0")}`;
    this._id = newId;
    next();
  } catch (err) {
    console.error("Error in generating ID:", err);
    next(err);
  }
});

const Bookings = mongoose.model("Bookings", bookingsSchema);
export default Bookings;
