import express from "express";
import dotenv from "dotenv";
import { poolConnectDB } from "../db/connect.js";
import { filterData } from "../middleware/middleware.js";
import * as sqlQuery from "../db/statement/product.js";
const router = express.Router();
dotenv.config();
const pool = poolConnectDB();

router.get("/search/:keyword", (req, res) => {
  const keyboard = req.params["keyword"];
  let sql = sqlQuery.searchProduct(keyboard);
  pool.query(sql, function (err, results) {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(200).json(results);
  });
});

router.get("/", (req, res) => {
  let sql = sqlQuery.getAll();
  pool.query(sql, function (err, results) {
    if (err) {
      res.status(500).json({
        err:err,
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.json(results);
  });
});

router.get("/new", (req, res) => {
  let sql = sqlQuery.getNewProduct();
  pool.query(sql, function (err, results) {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.json(results);
  });
});

router.get("/type/:nameType", (req, res) => {
  const nameType = req.params["nameType"];
  let sql;
  switch (nameType) {
    case "laptop":
      sql = sqlQuery.getProductByType(1);
      break;
    case "keyboard":
      sql = sqlQuery.getProductByType(2);
      break;
    case "monitor":
      sql = sqlQuery.getProductByType(3);
      break;
    case "memory":
      sql = sqlQuery.getProductByType(4);
      break;
    case "storage":
      sql = sqlQuery.getProductByType(5);
      break;
    case "vga":
      sql = sqlQuery.getProductByType(6);
      break;
    case "mouse":
      sql = sqlQuery.getProductByType(7);
      break;
    default:
      sql = false;
      break;
  }
  if (sql === false) {
    res.status(404).send("Url not found");
  } else {
    pool.query(sql, function (err, results) {
      if (err) {
        res.status(500).json({
          status:500,
          message: "A server error occurred. Please try again in 5 minutes.",
        });
        return;
      }
      res.json(
        Array.from(new Set(results.map((e) => {
          return {
            ...e,
            detail:JSON.parse(e.detail)
          }
        })))
      );
    });
  }
});

router.get("/detail/get/:idType/:idProduct", (req, res) => {
  const idType = req.params["idType"];
  const idProduct = req.params["idProduct"];
  let sql = sqlQuery.getDetail(idType, idProduct);
  pool.query(sql, function (err, results) {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.json(
      results.map((e) => {
        let subImg = JSON.parse(e.img)
        let formatResult =  {
          ...e,
          imgProduct:subImg.every(c => Object.values(c).every(value => value === null)) ? [{img:e.imgProduct,type:'default'}] :[{img:e.imgProduct,type:'default'},...subImg],
          detail:JSON.parse(e.detail)
        }
        delete formatResult.img
        return formatResult
      })
    );
  });
});

router.post("/insert", filterData, (req, res) => {
  const data = req.result;
  const folder = data.folder;
  const productInf = data.product;
  let resultProduct = productInf[0]
      resultProduct[2] = `${process.env.AWS_URL_IMG}/${folder}/${resultProduct[2]}`

  const resultDetail = data.detail
  const sqlProduct = sqlQuery.productInsertInfo(resultProduct);
  pool.query(sqlProduct, (err, results) => {
    if (err) {
      res.status(500).json({
        err1:err,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    const idProduct = results.insertId;
    const lastArr = [`${idProduct}`,...resultDetail.flatMap(e => e)];
    const lastResult = lastArr.map((item) => {
      if (/[a-zA-Z]/.test(item)) {
        return `"${item}"`;
      } else {
        return item;
      }
    });
    const sqlDetail = sqlQuery.productInsertDetail(productInf[0][4], lastResult);
    pool.query(sqlDetail, (err, results) => {
      if (err) {
        res.status(500).json({
          err2:err,
          message: "A server error occurred. Please try again in 5 minutes.",
        });
        return;
      }
      res.status(201).json({ message: "Add product to success" });
    });
  });
});

router.put("/update/:idType/:idProduct", filterData, (req, res) => {
  const data = req.result;
  const idProduct = req.params["idProduct"];
  const idType = req.params["idType"]
  const folder = data.folder;
  const product = data.product
    .map((e, i) => {
      if (i === 2) {
        return e.includes('https://') ? e : "'" + process.env.AWS_URL_IMG + "/" + folder + "/" + e + "'";
      } else {
        return /[a-zA-Z]/.test(e) ? "'" + e + "'" : e;
      }
    }).toString().split(",");
  const detail = data.detail;
  const sql = sqlQuery.productUpdate(idProduct, product);
  const sqlDetail = sqlQuery.productUpdateDetail(idType,idProduct,detail);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        err1:err,
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
    }
    pool.query(sqlDetail,(err,results) => {
      if (err) {
        res.status(500).json({
          err2:err,
          status:500,
          message: "A server error occurred. Please try again in 5 minutes.",
        });
      }
    })
    res.status(200).json({ message: "Update to success" });
  });
});
router.post("/image/add/:idProduct",(req,res) => {
  const idProduct = req.params['idProduct'];
  const data = req.body;
  let dataUrl;
  if(data.file){
    dataUrl = data.file.map(e => `${process.env.AWS_URL_IMG}/product/${e}`)
  }else{
    dataUrl = data.urlImage
  }
  const sql = sqlQuery.productAddImg(idProduct,dataUrl)
  pool.query(sql,(err,results) => {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(201).json({status:201,message:'Add image to success'});
  })
})
router.delete("/delete/:idProduct", filterData, (req, res) => {
  const idProduct = req.params["idProduct"];
  const sql = sqlQuery.productDelete(idProduct);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(200).json({ message: "Delete product to success" });
  });
});
router.delete("/list/delete", filterData, (req, res) => {
  const data = req.result;
  const list_cart = data.list.join(",");
  const sql = sqlQuery.productDeleteList(list_cart);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(200).json({ message: "Delete success" });
  });
});
export default router;
