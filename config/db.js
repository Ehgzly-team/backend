import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // 🔹 Replace with your MongoDB connection string
    await mongoose.connect("mongodb+srv://devo:38Jo7UeYfaqNFPKj@cluster0.yboj4nz.mongodb.net/testing?appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
};

export default connectDB;
