import express from "express";
import multer from "multer";
import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import path from "path";
import courtModules from "../modules/court.js";

const router = express.Router();

// GET /pagination?page=1&limit=10&type=all
router.get("/pagination", async (req, res) => {
  try {
    let query = {};
    if (req.query.type && req.query.type !== "all") {
      query.type = req.query.type;
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "10", 10));
    const skip = (page - 1) * limit;

    const courts = await courtModules.find(query).skip(skip).limit(limit);
    res.json({ data: courts, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

// POST /add
router.post("/add", async (req, res) => {
  try {
    const { name, location, type, rate, pricePerHour, owner, image_path, bookings } = req.body;
    if (!name || !location || !type || rate == null || pricePerHour == null || !owner || !image_path) {
      return res.status(400).send({ msg: "Missing required fields" });
    }

    const court = new courtModules({ name, location, type, rate, pricePerHour, owner, bookings, image_path });
    await court.save();
    return res.status(200).send({ msg: `Court Created with name ${court.name}!!`, court });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

export default router;