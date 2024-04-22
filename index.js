import express from "express";
import dotenv from "dotenv";
import productRouter from "./api/product.js";
import cartRouter from "./api/cart.js";
import transRouter from "./api/transport.js";
import wareRouter from "./api/warehouse.js";
import authRouter from "./user/auth.js";
import userRouter from "./user/user.js";
import commentRouter from "./api/comment.js";
import postsRouter from "./api/posts.js"
import oderRouter from "./api/order.js"
import statisticalRouter from "./api/statistical.js";
import {
  filterData,
  verify,
  handleCheckRole,
} from "./middleware/middleware.js";
import AWS from "aws-sdk";
import fs from "fs";
import fileUpload from "express-fileupload";
import rateLimit from "express-rate-limit";
const app = express();
const PORT = process.env.PORT || 1705;

dotenv.config();
app.use(express.json());
//config cors
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", ['https://dinhphat.tech','https://admintech-74572.web.app/']);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: process.env.LIMIT_REQ,
  handler: function (req, res) {
    res.status(429).send({
      status: 500,
      message: 'Too many requests!',
    });
  },
});
app.use((req, res, next) => {
  console.log(`Endpoint: ${req.originalUrl}`);
  next();
});

// Test
app.get("/", (req, res) => {
  res.json("Hello!");
});

//save image to aws s3

AWS.config.update({ region: "ap-southeast-1" });
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SKEY,
  },
});

app.post("/upload/:folder", async (req, res) => {
  const files = req.files;
  const folder = req.params["folder"];

  for (let fileKey in files) {
    let file = files[fileKey];
    const fileData = fs.readFileSync(file.tempFilePath);
    const uploadParams = {
      Bucket: "express-image-upload",
      Key: folder + "/" + file.name,
      Body: fileData,
      ContentType: file.mimetype,
      ACL: "public-read",
    };
    try {
      const data = await s3.upload(uploadParams).promise();
      console.log("Upload Success", file.name);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  res.status(201).json({ message: "All files uploaded successfully" });
});

const routerArr = [
  { path: "product", routes: productRouter },
  { path: "cart", routes: cartRouter },
  { path: "transports", routes: transRouter },
  { path: "comment", routes: commentRouter },
  { path: "ware", routes: wareRouter },
  { path: "statistical", routes: statisticalRouter },
  { path: "posts", routes: postsRouter },
  { path: "order", routes: oderRouter },
];
routerArr.map((e) => app.use(`/api/${e.path}`,apiLimiter, e.routes));
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.get("/restart", (req, res) => {
  res.json("Restart success");
});
app.use(filterData);
app.use(verify);
app.use(handleCheckRole);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
