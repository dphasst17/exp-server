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
        return {
          ...e,
          detail:JSON.parse(e.detail)
        }
      })
    );
  });
});

router.post("/insert", filterData, (req, res) => {
  const data = req.result;
  const folder = data.folder;
  const productInf = data.product;
  const queryCheck = false;
  const resultProduct = productInf
    .map((e, i) => {
      if (i === 2) {
        return "'" + process.env.AWS_URL_IMG + "/" + folder + "/" + e + "'";
      } else {
        return /[a-zA-Z]/.test(e) ? "'" + e + "'" : e;
      }
    })
    .toString();
  const resultDetail = data.detail
    .map((item) => {
      if (/[a-zA-Z]/.test(item)) {
        return "'" + item + "'";
      } else {
        return item;
      }
    })
    .toString();
  const sqlProduct = sqlQuery.productInsertInfo(resultProduct);

  pool.query(sqlProduct, (err, results) => {
    if (err) {
      res.status(500).json({
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    const idProduct = results.insertId;
    const lastResult = `${idProduct},${resultDetail}`;
    const sqlDetail = sqlQuery.productInsertDetail(productInf[5], lastResult);
    pool.query(sqlDetail, (err, results) => {
      if (err) {
        res.status(500).json({
          message: "A server error occurred. Please try again in 5 minutes.",
        });
        return;
      }
      return (queryCheck = true);
    });
  });

  queryCheck === true && res.status(201).json({ message: "Add product to success" });
});

router.put("/update/:idProduct", filterData, (req, res) => {
  const data = req.result;
  const idProduct = req.params["idProduct"];
  const folder = data.folder;
  const product = data.product
    .map((e, i) => {
      if (i === 2) {
        return e.includes('https://') ? e : "'" + process.env.AWS_URL_IMG + "/" + folder + "/" + e + "'";
      } else {
        return /[a-zA-Z]/.test(e) ? "'" + e + "'" : e;
      }
    })
    .toString();
  const detail = data.detail;
  const idType = product[4]
  const sql = sqlQuery.productUpdate(idProduct, product);
  const sqlDetail = sqlQuery.productUpdateDetail(idType,idProduct,detail)
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    pool.query(sqlDetail,(err,results) => {
      if (err) {
        res.status(500).json({status:500,
          message: "A server error occurred. Please try again in 5 minutes.",
        });
        return;
      }
      res.status(204).json({ message: "Update to success" });
    })
  });
});
router.put("/detail/update/:idType/:idProduct", filterData, (req, res) => {
  const data = req.result;
  const idType = req.params["idType"];
  const idProduct = req.params["idProduct"];
  const resultDetail = data.detail.map((e) => {
    if (/[a-zA-Z]/.test(item)) {
      return "'" + item + "'";
    } else {
      return item;
    }
  });
  const sql = sqlQuery.productUpdateDetail(idType, idProduct, resultDetail);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(204).json({ message: "Update product to success" });
  });
});
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
