import express from "express";
import dotenv from "dotenv";
import { poolConnectDB } from "../db/connect.js";
import { filterData } from "../middleware/middleware.js";
import * as sqlQuery from "../db/statement/product.js";
import * as response from "../utils/handler.js"
import * as message from "../utils/message.js"
const router = express.Router();
dotenv.config();
const pool = poolConnectDB();
router.get("/search/:keyword", (req, res) => {
  const keyword = req.params["keyword"];
  const getCol = sqlQuery.getColDemo();
  pool.query(getCol, (err, results) => {
    response.errResponseMessage(res,err,500,message.err500Message())
    const parseData = results.map((e) => {
      return {
        ...e,
        shortName: e.type.slice(0, 2),
        detail: JSON.parse(e.detail),
      };
    });
    const sql = sqlQuery.search(parseData, keyword);
    pool.query(sql, (errRes, lastResult) => {
      response.errResponseMessage(res,errRes,500,message.err500Message())
      res.json(lastResult);
    });
  });
});
router.get("/", (req, res) => {
  const getCol = sqlQuery.getColDemo();
  pool.query(getCol, (err, results) => {
    response.errResponseMessage(res,err,500,message.err500Message())

    const parseData = results.map((e) => {
      return {
        ...e,
        shortName: e.type.slice(0, 2),
        detail: JSON.parse(e.detail),
      };
    });
    const sql = sqlQuery.getAllProduct(parseData);
    pool.query(sql, (errRes, lastResult) => {
      response.errResponseMessage(res,errRes,500,message.err500Message())

      res.status(200).json(lastResult);
    });
  });
});
router.get('/sale',(req,res) => {
  const currentDate = new Date().toISOString().split('T')[0]
  const sql = sqlQuery.getProductSale(currentDate);
  pool.query('SET SESSION group_concat_max_len = 1000000;',(errTest,resultsTest) => {

    pool.query(sql,(err,results) => {
      response.errResponseMessage(res,err,500,message.err500Message())
      const parseData = results.map(e => {
        return {
          ...e,
          startDate:response.formatDate(e.startDate),
          endDate:response.formatDate(e.endDate),
          detail:JSON.parse(e.detail)
        }
      })
      response.successResponseData(res,200,parseData)
    })
  })
})
router.get("/new", (req, res) => {
  let sql = sqlQuery.getNewProduct();
  pool.query(sql, function (err, results) {
    response.errResponseMessage(res,err,500,message.err500Message())

    res.status(200).json(results);
  });
});
router.get("/type/:type", (req, res) => {
  const name = req.params["type"];
  const shortName = name.split("")[0];
  const sql = sqlQuery.getColDetail(name);
  pool.query(sql, (err, results) => {
    response.errResponseMessage(res,err,500,message.err500Message())

    const sqlResult = sqlQuery.getProductDetailByType(results, name, shortName);
    pool.query(sqlResult, (lastErr, lastResult) => {
      response.errResponseMessage(res,lastErr,500,message.err500Message())
      
      res.status(200).json(
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
    response.errResponseMessage(res,err,500,message.err500Message())

    const sql = sqlQuery.getProductDetail(
      results,
      nameType,
      shortName,
      idProduct
    );
    pool.query(sql, (lastErr, lastResult) => {
      response.errResponseMessage(res,lastErr,500,message.err500Message())

      res.status(200).json(
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
    response.errResponseMessage(res,err,500,message.err500Message())

    pool.query(sql, (error, resultInsert) => {
      response.errResponseMessage(res,error,500,message.err500Message())

      pool.query(addInfoTable, (errs, addResult) => {
        response.errResponseMessage(res,errs,500,message.err500Message())

        response.successResponseMessage(res,201,message.createItemsMessage('the new type'))
        /* res.status(201).json({ status: 201, message: "Create success" }); */
      });
    });
  });
});
router.get("/info/type", (req, res) => {
  const sql = sqlQuery.getInfoType();
  pool.query(sql, (err, results) => {
    response.errResponseMessage(res,err,500,message.err500Message())
   
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
// add column or drop column in table
router.post("/column/:method/:table", filterData, (req, res) => {
  const table = req.params["table"];
  const method = req.params["method"];
  const data = req.result;
  const sql = sqlQuery.changeTable(table, method, data.column, data.datatypes);
  pool.query(sql, (err, results) => {
    response.errResponseMessage(res,err,500,message.err500Message())
    response.successResponseMessage(res,201,method === 'add' ? message.createItemsMessage(data.column) : message.removeItemsMessage(data.column))
  });
});
//change it
router.post("/discount", filterData, (req, res) => {
  const data = req.result;
  const listIdProduct = data.list;
  const sql = sqlQuery.updateDiscount(data.discount, listIdProduct);
  pool.query(sql, (err, results) => {
    response.errResponseMessage(res,err,500,message.err500Message())

    res.status(200).json({ status: 201, message: "Update discount success" });
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
    response.errResponseMessage(res,errProduct,500,message.err500Message())

    const idProduct = resultProduct.insertId;
    pool.query(sqlGetCol, (err, results) => {
      response.errResponseMessage(res,err,500,message.err500Message())

      const sqlDetail = sqlQuery.insertProductDetail(
        productInf[4],
        idProduct,
        results,
        detail
      );
      pool.query(sqlDetail, (errDetail, resultDetail) => {
        response.errResponseMessage(res,errDetail,500,message.err500Message())
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
    response.errResponseMessage(res,err,500,message.err500Message())

    pool.query(sqlGetCol, (errCol, results) => {
      response.errResponseMessage(res,errCol,500,message.err500Message())

      const sqlUpdateDetail = sqlQuery.updateDetail(
        results,
        idProduct,
        detail,
        nameType
      );
      pool.query(sqlUpdateDetail, (errDetail, resultDetail) => {
        response.errResponseMessage(res,errDetail,500,message.err500Message())
        response.successResponseMessage(res,200,message.updateItemsMessage('product'))
        /* res.status(200).json({ status: 200, message: "Update to success" }); */
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
    response.errResponseMessage(res,err,500,message.err500Message())

    res.status(201).json({ status: 201, message: "Add image to success" });
  });
});
router.delete("/delete/:idProduct", filterData, (req, res) => {
  const idProduct = req.params["idProduct"];
  const sql = sqlQuery.productDelete(idProduct);
  pool.query(sql, (err, results) => {
    response.errResponseMessage(res,err,500,message.err500Message())

    res.status(200).json({ message: "Delete product to success" });
  });
});
router.delete("/list/delete", filterData, (req, res) => {
  const data = req.result;
  const list_cart = data.list.join(",");
  const sql = sqlQuery.productDeleteList(list_cart);
  pool.query(sql, (err, results) => {
    response.errResponseMessage(res,err,500,message.err500Message())
    
    res.status(200).json({ message: "Delete success" });
  });
});
export default router;
