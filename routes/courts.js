import express from "express";
import multer from "multer";
import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import path from "path";
import courtModules from "../modules/court.js";
import { readFileSync } from "fs";
const serviceAccount = JSON.parse(
  readFileSync(new URL('../config/ehgzly.json', import.meta.url), 'utf8')
);
const router = express.Router();


export default router;