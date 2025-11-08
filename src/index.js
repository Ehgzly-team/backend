import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import userRoutes from "../routes/user.js";
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

// APP Uses
app.use(express.json());
app.use("/api/users", userRoutes); // base of all users routes
app.use(cors({
  origin: '*' 
}));

// Connect to DB
connectDB();


// Home route
app.get("/", (req, res) => {
  res.send({ msg: "Hello Dude" });
});

// Start listening
app.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));

export default app;
