import express from "express";
import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import path from "path";
import multerPkg from "multer";
import fs from "fs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import courtModules from "../modules/court.js";
const serviceAccount = JSON.parse(
  readFileSync(new URL('../config/ehgzly.json', import.meta.url), 'utf8')
);

admin.initializeApp({credential:admin.credential.cert(serviceAccount),
  storageBucket:'ehgzly-76270.appspot.com'
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "upload");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const router = express.Router();


router.get("/pagination", async (req, res) => {
  query = {};
  if (req.query.type != "all") {
    query["type"] = req.query.type;
  }
  const page=req.query.page;
  const limit=req.query.limit;

  const skip = (page-1)*limit;
  const courts = await courtModules.find(query).skip(skip).limit(limit);

  res.json({data:courts})
});

router.post("/add",async (req,res)=>{
try{
 const {name,location,type,rate,pricePerHour,owner,image_path,bookings} = req.body;
 court= new courtModules({name,location,type,rate,pricePerHour,owner,bookings,image_path})
 await court.save();
 return res.status(200).send({ msg: `Court Created with name ${court.name}!!` });
}catch(err){
  console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
}
});


export default router;