import express from "express";
import multer from "multer";
import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import path from "path";
import courtModules from "../modules/court.js";
import serviceAccount from "../config/ehgzly.json"assert {type:'json'};
const router = express.Router();


export default router;