import express from "express";
import dotenv from "dotenv";
import productRouter from "./api/product.js";
import cartRouter from "./api/cart.js";
import transRouter from "./api/transport.js";
import wareRouter from "./api/warehouse.js"
import authRouter from "./user/auth.js";
import userRouter from "./user/user.js";
import commentRouter from "./api/comment.js"
import {filterData,verify,handleCheckRole} from "./middleware/middleware.js";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import fs from 'fs';
import fileUpload from "express-fileupload";
const app = express();
const PORT = process.env.PORT || 1705;

dotenv.config();
app.use(express.json());
//config cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,authorization");
    next();
});

// Test
app.get('/',(req,res) => {
    res.send("Hello!")
})

//save image to aws s3

AWS.config.update({region:'ap-southeast-1'})
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}))
const s3 = new AWS.S3({
    credentials:{
        accessKeyId:process.env.AWS_KEY,
        secretAccessKey:process.env.AWS_SKEY
    }
})

app.post('/upload/:folder',async (req, res) => {
  const file = req.files.file;
  const folder = req.params['folder'];
  const fileData = fs.readFileSync(file.tempFilePath);
  const uploadParams = {
    Bucket: 'express-image-upload',
    Key: folder + "/" + file.name,
    Body: fileData,
    ContentType: file.mimetype,
    ACL:'public-read'
  };
  try {
    const data = await s3.upload(uploadParams).promise();
    console.log("Upload Success", data.Location);
    res.json("Upload image to success");
  } catch (err) {
    res.status(500).json(err)
  }
}); 
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/transports', transRouter);
app.use('/api/ware', wareRouter);
app.use('/api/comment',commentRouter);
app.use('/auth',authRouter);
app.use('/user',userRouter);
app.get('/restart', (req,res) => {
    res.send("Restart success")
})
app.use(filterData);
app.use(verify);
app.use(handleCheckRole);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });