import express from "express";
import multer from "multer";
import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import path from "path";
import courtModules from "../modules/court.js";

import serviceAccount from "../config/ehgzly.json"assert {type:'json'};

admin.initializeApp({credential:admin.credential.cert(serviceAccount),
  storageBucket:'ehgzly-76270.appspot.com'
});

const bucket =getStorage().bucket();
const upload = multer({dest:"upload/"})

const router = express.Router();

router.post("/uploadImg",upload.single('image'),async(req,res)=>{
  try{
    if(!req.file)return res.status(400).json({msg:"no file uploaded"});

    const uploadResult = await bucket.upload(req.file.path,{
      destination:`images/${req.file.originalname}`,
      public:true,
      metadata:{contentType:req.file.mimetype}
    });
    const file =uploadResult[0];
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    res.json({url:publicUrl});
  }catch(err){
    console.log(err);
    res.status(500).send('Error uploading file');
  }
});

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