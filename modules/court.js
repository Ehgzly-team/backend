import mongoose from "mongoose";


const courtSchema = new mongoose.Schema({
    _id: { type: String },
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Football', 'Basketball', 'Tennis', 'Badminton', 'Volleyball']
    },
    rate: {
        type: Number,
        required: true,
        min: 1,
        max: 5          
    },
    pricePerHour: {
        type: Number,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    bookings: {
        type: Array, 
        default: [] 
    }
});



// This runs before saving a new user
courtSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "court_id" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const newId = `CRT-${counter.value.toString().padStart(6, "0")}`;
    this._id = newId;
    next();
  } catch (err) {
    console.error("Error in generating ID:", err);
    next(err);
  }
});



const Courts = mongoose.model("Court", courtSchema);
export default Courts;