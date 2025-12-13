import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import userRoutes from "../routes/user.js";
import courtRoutes from "../routes/courts.js";
// import uploadRoutes from"../routes/upload.js"
import cors from 'cors';
import { logger } from "../middlewares/logger.js";
import { errorHandler } from "../middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

// APP Uses
app.use(express.json());
app.use(logger)
app.use(express.json({ limit: '10mb' })); // increase limit if needed
// app.use(express.raw({ type: 'image/*', limit: '10mb' }));
app.use("/api/courts", courtRoutes); // base of all courts routes
app.use("/api/users", userRoutes); 
// app.use("/api",uploadRoutes);// base of all users routes
app.use(cors({
  origin: '*' 
}));

// Global error handler
app.use(errorHandler);

// Connect to DB
connectDB();


// Home route
app.get("/", (req, res) => {
  res.send({ msg: "Hello Dude" });
});

// Start listening
app.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));

// Prevent the process from crashing on unhandled errors.
// We log them and keep the process running to satisfy "not ever crash" requirement.
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
