import express from "express";
import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import courtModules from "../modules/court.js";
import userModules from "../modules/user.js";
import { authenticateToken } from "../middlewares/auth.js";
import bookingModules from "../modules/bookings.js";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "ehgzly-76270",
      privateKeyId: "d217087ad961ba21af000b6e280a381dfd1ac115",
      clientId: "112980827874613519904",
      clientEmail: "firebase-adminsdk-fbsvc@ehgzly-76270.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD1+To8iRO5q1Ux\nTLnnZxgXG1N423vj6nAZzjN1Ogm0sVnsdBNEFlu0Q3tb6027j5ZDKn9rR+zYfJHp\nt6YQAPnazLUgPvP7jMwgkpZ981TXRkRMywJU6JowqJ/ic+EuLx/SnOmAlTqZ4oKW\nZoQhme6eT71aymA5JLrd878OByCzepzYFgMU8Yc5DttjBaGNWTh0zzqvh8AqTHZP\nziFHXxMfhYdQF27t4WjBULzfL1xTBGFXtoWeYRiQOxPUXQfS51Z4fX892RF9+Lvt\newVr5O85xkLApea0aiJRfnpxeWQQoPIrOY17474RciIAkJKhsSjtopCZauB0tUFk\ng5YosGhBAgMBAAECggEAVBiaIxFAp7WewmS3mJiEQX4ru0HbKTDBk+kOadFmeRs7\nod6Lqbc1MjvyJJqd8Hbmil8wwjaMkPWCE5Sg147l3bsoX/Z2BzZ7odVMU5KKmrFg\n75pm2S3PbbxxMYSp49bju+e+46Hhr7QkLpStLynITeL4W96eKFtY8kKAOyUPtpyV\nBMeIMM8Oz97qVFk5EvOqgnWdHJLRBUwY2V0i8lKobc8A/sOJSZzuqsDJwsgrR5x2\nsU3RS4uMMkCtUTPnvU737XQQSMASL5/ZdEkj+DWpBTC7lKU5zb8yuPJ8NiXqX6Qt\nwgDZrK6rRz8E3620n8B3BfREdEvzgTGrmkePCMPDIwKBgQD8d9Cy80cEztpdbbRK\n0i7bGcpLmosKW8vWSXDTBY+GtLZW9FLy4hCU/FFa8QQI48ctASf/SXekZtCqpyXI\n4hMPeN+68pnFiXYKF0LHn43J38E8m+ajNxpTrMH4rCT9hOeAPE4z1QKZ72G5aZWK\nQGGPwiU029600ufnPpaV8LDVMwKBgQD5aicsbHbgmBSf7CvUn79yk5cLhG4PH05k\nbOrw6FDFX1yriuKJwTe8rU1XtawSGgnFKtUI2YPnQCumr5TGDyBpnLmea9y/tq03\n9NI3dvDb0gWb+0C309XPBNTxmA+2MMu/3OUO/kALpNzctUYU79zitxX6XLsi33fN\nWX3o1VCkuwKBgCrgRkc93Z/JaXhYezgBvgdjt+FjG53kvRdlXY3Y8ekUo6rcz4GE\nNwC2YTKqn97KoDbabWqDlZgMBgAVZutYyZflFUnwjYDouW05ShQQ2smgAHdEmsS5\nRPVU75RF1/peKdqzYyyWTlzKNLSCY+0YxfjeJed2N7pJ3yx8iqJoP//VAoGBAKfw\nMjBXWDQiMsD75QdmCSK8/hdjNDg6fC5iqE9OHhTIAT4AZkkbMMx6ZHmKejI2Fh4M\nmSU8UPSE4N97mlFCHjD+tn1VY24zMq9aybFPBR7+a4h7xTgCCxU5y6hhGzMx5/9o\nXVObHsS4XX6/EFFIsRJ29PV/OwJgNeqvN3hvKb3BAoGBAN/CJF5nDOUIP0FKzCGK\nbwLtbUOuxceNo+jDj85PmtA8jnQnGWPe00rrSSEIKr/y+X3dlt3OfXzuSmu7yare\nBAjbVKgBMflK0dlrBxL9e/0j4q9Hvx5HevtqWEN8KHEalxHHni0kf3yE08b/bFX2\n66M+9veaBDKmkYGvelTwaFGw\n-----END PRIVATE KEY-----\n".replace(/\n/g, '\n'),
    }),
    storageBucket:'ehgzly-76270.appspot.com'
  });
}

const db = admin.firestore();
const bucket = getStorage().bucket();
const router = express.Router();


router.post('/upload', async (req, res) => {
  try {
    const fileName = req.query.name || 'uploaded_image.jpg';
    const buffer = req.body; // raw binary data

    const file = bucket.file(`uploads/${fileName}`);
    await file.save(buffer, {
      metadata: { contentType: req.headers['content-type'] },
      public: true
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    res.json({ url: publicUrl });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading image');
  }
});


router.get("/pagination", async (req, res) => {
  try {
    const query = {};
    if (req.query.type != "all") {
      query.type = req.query.type;
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const courts = await courtModules.find(query).skip(skip).limit(limit);
    res.status(200).json({ data: courts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
router.post("/pagination/mycourts", authenticateToken, async (req, res) => {
  try {
    const user = await userModules.findOne({ _id: req.user.id });
    const query = { _id: { $in: user.owned_courts } };
    const { page = 1, limit = 10, type = "all" } = req.body;
    if (type != "all") {
      query.type = type;
    }
    const total = await courtModules.countDocuments(query);
    if (total) {
      const skip = (page - 1) * limit;
      const courts = await courtModules.find(query).skip(skip).limit(limit);
      res.status(200).json({ data: courts });
    } else {
      res.status(200).json({ data: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/times/:courtId", authenticateToken, async (req, res) => {
  try {
    const { courtId } = req.params;
    const { date } = req.query;
    if (!courtId) return res.status(400).send({ msg: "No Court ID !!" });
    if (!date) return res.status(400).send({ msg: "No Booking Date !!" });

    // Convert date string to Date object for comparison
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0); // Set time to start of day
    
    // Find all bookings for this court on the specified date
    const bookings = await bookingModules.find({
      courtId: courtId,
      bookingDate: {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000) // Next day
      }
    });

    // Extract all booked time slots
    const bookedTimes = bookings.reduce((times, booking) => {
      return times.concat(booking.times);
    }, []);

    res.status(200).json({ bookedTimes }["bookedTimes"]);

  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

router.post("/add",async (req,res)=>{
try{
 const {name,location,type,rate,pricePerHour,owner,image_path,bookings} = req.body;
 if (!name || !location || !type || !rate || !pricePerHour || !owner || !image_path) {
    return res.status(400).send({ msg: "Bad Request" });
  }
 let court= new courtModules({name,location,type,rate,pricePerHour,owner,bookings,image_path})
 await court.save();
 return res.status(200).send({ msg: `Court Created with name ${court.name}!!` });
}catch(err){
  console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
}
});


export default router;