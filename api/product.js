import express from "express";
import dotenv from "dotenv";
import { poolConnectDB } from "../db/connect.js";
import { filterData } from "../middleware/middleware.js";
import * as sqlQuery from "../db/statement/product.js";
const router = express.Router();
dotenv.config();
const pool = poolConnectDB();

router.get("/search/:keyword", (req, res) => {
  const keyword = req.params["keyword"];
  const getCol = sqlQuery.getColDemo();
  pool.query(getCol, (err, results) => {
    if (err) {
      res.status(500).json({
        status: 500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    const parseData = results.map((e) => {
      return {
        ...e,
        shortName: e.type.slice(0, 2),
        detail: JSON.parse(e.detail),
      };
    });
    const sql = sqlQuery.search(parseData, keyword);
    pool.query(sql, (errRes, lastResult) => {
      if (errRes) {
        res.status(500).json({
          status: 500,
          message: "A server error occurred. Please try again in 5 minutes.",
        });
        return;
      }
      res.json(lastResult);
    });
  });
});
router.get("/", (req, res) => {
  const getCol = sqlQuery.getColDemo();
  pool.query(getCol, (err, results) => {
    if (err) {
      res.status(500).json({
        status: 500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    const parseData = results.map((e) => {
      return {
        ...e,
        shortName: e.type.slice(0, 2),
        detail: JSON.parse(e.detail),
      };
    });
    const sql = sqlQuery.getAllProduct(parseData);
    pool.query(sql, (errRes, lastResult) => {
      if (errRes) {
        res.status(500).json({
          status: 500,
          message: "A server error occurred. Please try again in 5 minutes.",
        });
        return;
      }
      res.json(lastResult);
    });
  });
});

router.get("/new", (req, res) => {
  let sql = sqlQuery.getNewProduct();
  pool.query(sql, function (err, results) {
    if (err) {
      res.status(500).json({
        status: 500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.json(results);
  });
});
router.get("/type/:type", (req, res) => {
  const name = req.params["type"];
  const shortName = name.split("")[0];
  const sql = sqlQuery.getColDetail(name);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        status: 500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    const sqlResult = sqlQuery.getProductDetailByType(results, name, shortName);
    pool.query(sqlResult, (lastErr, lastResult) => {
      if (lastErr) {
        res.status(500).json({
          status: 500,
          message: "A server error occurred. Please try again in 5 minutes.",
        });
        return;
      }
      res.json(
        lastResult.map((e) => {
          return {
            ...e,
            detail: JSON.parse(e.detail),
          };
        })
      );
    });
  });
});
router.get("/detail/get/:nameType/:idProduct", (req, res) => {
  const nameType = req.params["nameType"];
  const idProduct = req.params["idProduct"];
  const shortName = nameType.slice(0, 2);
  const sql = sqlQuery.getColDetail(nameType);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        status: 500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    const sql = sqlQuery.getProductDetail(
      results,
      nameType,
      shortName,
      idProduct
    );
    pool.query(sql, (lastErr, lastResult) => {
      if (lastErr) {
        res.status(500).json({
          last: lastErr,
          status: 500,
          message: "A server error occurred. Please try again in 5 minutes.",
        });
        return;
      }
      res.json(
        lastResult.map((e) => {
          let subImg = JSON.parse(e.img);
          let formatResult = {
            ...e,
            imgProduct: subImg.every((c) =>
              Object.values(c).every((value) => value === null)
            )
              ? [{ img: e.imgProduct, type: "default" }]
              : [{ img: e.imgProduct, type: "default" }, ...subImg],
            detail: JSON.parse(e.detail),
          };
          delete formatResult.img;
          return formatResult;
        })
      );
    });
  });
});
router.post("/insert/type", filterData, (req, res) => {
  const data = req.result;
  const tbName = data.tbName;
  const arr = data.arrCol;
  const sqlInsert = sqlQuery.insertType(tbName);
  const sql = sqlQuery.createNewTypeTB(tbName, arr);
  const addInfoTable = sqlQuery.addInfoTable(tbName, arr);
  pool.query(sqlInsert, (err, results) => {
    if (err) {
      res.status(500).json({
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    pool.query(sql, (error, resultInsert) => {
      if (error) {
        res.status(500).json({
          message: "A server error occurred. Please try again in 5 minutes.",
        });
        return;
      }
      pool.query(addInfoTable, (errs, addResult) => {
        if (errs) {
          res.status(500).json({
            message: "A server error occurred. Please try again in 5 minutes.",
          });
          return;
        }
        res.status(201).json({ status: 201, message: "Create success" });
      });
    });
  });
});
router.get("/info/type", (req, res) => {
  const sql = sqlQuery.getInfoType();
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    const parseData = results.map((e) => {
      return { ...e, detail: JSON.parse(e.detail) };
    });
    const filter = parseData.filter((e) => e.type !== "laptop");
    const lastResult = [parseData[1], ...filter];
    res.status(200).json({
      status: 200,
      data: lastResult,
    });
  });
});
/* new feature is here */
/* change column in the table (add || drop), method: post, endpoint: '/column/:method/:table',body:JSON.stringify({column:'',datatypes:''}) */
router.post("/column/:method/:table", filterData, (req, res) => {
  const table = req.params["table"];
  const method = req.params["method"];
  const data = req.result;
  const sql = sqlQuery.changeTable(table, method, data.column, data.datatypes);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(201).json({ status: 201, message: "Success" });
  });
});
/* New feature */
router.post("/discount", filterData, (req, res) => {
  const data = req.result;
  const listIdProduct = data.list;
  const sql = sqlQuery.updateDiscount(data.discount, listIdProduct);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(200).json({ status: 201, message: "Update success" });
  });
});
/*  */
router.get("/test/insert/:nameType", (req, res) => {
  const nameType = req.params["nameType"];
  const sql = `SELECT name,datatypes FROM typedetail WHERE type = '${nameType}'`;
  pool.query(sql, (err, results) => {
    res.json(results);
  });
});
router.post("/insert", filterData, (req, res) => {
  const data = req.result;
  const folder = data.folder;
  const productInf = data.product;
  productInf[2] = `${process.env.AWS_URL_IMG}/${folder}/${productInf[2]}`;
  const detail = data.detail;
  const sqlProduct = sqlQuery.productInsertInfo(productInf);

  const sqlGetCol = sqlQuery.getCol(productInf[4]);
  pool.query(sqlProduct, (errProduct, resultProduct) => {
    if (errProduct) {
      res.status(500).json({
        errProduct: errProduct,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    const idProduct = resultProduct.insertId;
    pool.query(sqlGetCol, (err, results) => {
      const sqlDetail = sqlQuery.insertProductDetail(
        productInf[4],
        idProduct,
        results,
        detail
      );
      pool.query(sqlDetail, (errDetail, resultDetail) => {
        if (errDetail) {
          res.status(500).json({
            errDetail: errDetail,
            message: "A server error occurred. Please try again in 5 minutes.",
          });
          return;
        }
        res
          .status(201)
          .json({ status: 201, message: "Add product to success" });
      });
    });
  });
});
router.put("/update/:nameType/:idProduct", filterData, (req, res) => {
  const data = req.result;
  const idProduct = req.params["idProduct"];
  const nameType = req.params["nameType"];
  const folder = data.folder;
  const product = data.product
    .map((e, i) => {
      if (i === 2) {
        return e.includes("https://")
          ? e
          : "'" + process.env.AWS_URL_IMG + "/" + folder + "/" + e + "'";
      } else {
        return /[a-zA-Z]/.test(e) ? "'" + e + "'" : e;
      }
    })
    .toString()
    .split(",");
  const detail = data.detail;
  const sql = sqlQuery.productUpdate(idProduct, product);
  const sqlGetCol = sqlQuery.getCol(nameType);
  pool.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({
        err: err,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    pool.query(sqlGetCol, (errCol, results) => {
      if (errCol) {
        res.status(500).json({
          errCol: errCol,
          message: "A server error occurred. Please try again in 5 minutes.",
        });
        return;
      }
      const sqlUpdateDetail = sqlQuery.updateDetail(
        results,
        idProduct,
        detail,
        nameType
      );
      pool.query(sqlUpdateDetail, (errDetail, resultDetail) => {
        if (errDetail) {
          res.status(500).json({
            errDetail: errDetail,
            message: "A server error occurred. Please try again in 5 minutes.",
          });
          return;
        }
        res.status(200).json({ status: 200, message: "Update to success" });
      });
    });
  });
});
router.post("/image/add/:idProduct", (req, res) => {
  const idProduct = req.params["idProduct"];
  const data = req.body;
  let dataUrl;
  if (data.file) {
    dataUrl = data.file.map((e) => `${process.env.AWS_URL_IMG}/product/${e}`);
  } else {
    dataUrl = data.urlImage;
  }
  const sql = sqlQuery.productAddImg(idProduct, dataUrl);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        status: 500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(201).json({ status: 201, message: "Add image to success" });
  });
});
router.delete("/delete/:idProduct", filterData, (req, res) => {
  const idProduct = req.params["idProduct"];
  const sql = sqlQuery.productDelete(idProduct);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        status: 500,
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
        status: 500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(200).json({ message: "Delete success" });
  });
});
export default router;
