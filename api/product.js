import express from "express";
import dotenv, { parse } from "dotenv";
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
router.get('/sale/all',(req,res) => {
  const sql = sqlQuery.getAllProductSale();
  pool.query(sql,(err,results) => {
    response.errResponseMessage(res,err,500,message.err500Message())
    const parseData = results.map(e => {
      return {
        ...e,
        startDate:response.formatDate(e.startDate),
        endDate:response.formatDate(e.endDate),
      }
    })
    response.successResponseData(res,200,parseData)
  })
})

router.get('/sale/detail/:id',(req,res) => {
  const idSale = req.params['id']
  const sql = sqlQuery.getDetailSale(idSale);
  pool.query('SET SESSION group_concat_max_len = 1000000;',(errTest,resultsTest) => {
    pool.query(sql,(err,results) => {
      response.errResponseMessage(res,err,500,message.err500Message())
      
      response.successResponseData(res,200,results)
    })
  })
})
router.post('/sale',(req,res) => {
  const data = req.body;
  const sql = sqlQuery.insertSale(data.title,data.startDate,data.endDate)
  pool.query(sql,(err,results) => {
    response.errResponseMessage(res,err,500,message.err500Message())
    const newId = results.insertId;
    const sqlDetail = sqlQuery.insertSaleDetail(newId,data.detail);
    pool.query(sqlDetail,(errDetail,resultsDetail) => {
      response.errResponseMessage(res,errDetail,500,message.err500Message())
      const data = {
        id:newId,
        message:message.createItemsMessage('event sale')
      }
      response.successResponseData(res,201,data)
    })
  })
})
router.patch('/sale',(req,res) => {
  const data = req.body
  const sql = sqlQuery.updateSale(data);
  pool.query(sql,(err,results) => {
    response.errResponseMessage(res,err,500,message.err500Message())
    response.successResponseMessage(res,200,message.updateItemsMessage('sale'))
  })
})
router.delete('/sale',(req,res) => {
  const data = req.body;
  const sql = sqlQuery.deleteSale(data.idSale);
  const sqlDetail = sqlQuery.deleteSaleDetail(data.idSale);
  pool.query(sqlDetail,(errDetail,resultsDetail) => {
    response.errResponseMessage(res,errDetail,500,message.err500Message())
    pool.query(sql,(err,results) => {
      response.errResponseMessage(res,err,500,message.err500Message())
      response.successResponseMessage(res,200,message.removeItemsMessage('sale'))
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
/* Đoạn này thêm set group concat max length vào */
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
          const parseDetail = JSON.parse(e.detail)
          return {
            ...e,
            detail: [parseDetail[0]],
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
          let parseDetail = JSON.parse(e.detail);
          let resultData = {}
          Object.keys(parseDetail[0]).forEach(key => {
            let values = parseDetail.map(d => d[key]);
            resultData[key] = Array.from(new Set(values));
          });
          let formatResult = {
            ...e,
            imgProduct: subImg.every((c) =>
              Object.values(c).every((value) => value === null)
            )
              ? [{ img: e.imgProduct, type: "default" }]
              : [{ img: e.imgProduct, type: "default" }, ...subImg],
            detail: [resultData],
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
{
idProduct:1
nameProduct:"Msi Bravo"
price:840
imgProduct:"https://asset.msi.com/resize/image/global/product/product_162175108621129650150f18f256a57cdb5001e680.png62405b38c58fe0f07fcef2367d8a9ba1/400.png"
dateAdded:"2023-05-25T17:00:00.000Z"
des:"A laptop is a portable computer that is designed to be used on the go. It typically has a built-in screen, keyboard, and touchpad or trackpad. Laptops come in a variety of sizes and configurations, ranging from lightweight ultrabooks to high-performance gaming laptops. They are powered by rechargeable batteries and can be used for a variety of tasks, such as browsing the web, creating documents, playing games, and more."
view:124
idType:1
brand:"msi"
nameType:"laptop"
discount:5
quantity:"136"
detail:[
  {
    "os":["Windows 11 Pro","Windows 11 Home"],
    "cpu":["AMD Ryzen 5 5800H","AMD Ryzen 7 5000 Series"],
    "maxram":["64GB"],
    "battery":["53Wh"],
    "storage":["1TB","512GB"],
    "capacity":["16GB","8GB"],
    "material":["Vỏ nhôm"],
    "sizeInch":[16,15.6],
    "resolution":["1920x1080"],
  }
]}
