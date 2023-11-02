import express from "express";
import { poolConnectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/comment.js";
import { verify, filterData } from "../middleware/middleware.js";
const router = express.Router();
const pool = poolConnectDB();

router.get("/", (req, res) => {
  const sql = sqlQuery.commentGetAll();
  pool.query(sql, function (err, results) {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    let lastResult = results.map(e => {
      return {
        ...e,
        detail:JSON.parse(e.detail)
      }
    })
    res.status(200).json({lastResult});
  });
});
router.get("/product/:idProduct", (req, res) => {
  const idProduct = req.params["idProduct"];
  const sql = sqlQuery.getCommentByIdProduct(idProduct);
  pool.query(sql, function (err, results) {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(200).json(results.map(e => {
      const resultDetail = JSON.parse(e.detail)
      return {
        ...e,
        detail:resultDetail.every(c => Object.values(c).every(value => value === null)) ? [] : resultDetail
      }
    }));
  });
});
router.post("/insert/:idProduct",verify,filterData,(req,res) => {
  const idUser = req.idUser;
  const data = req.result;
  const idProduct = req.params['idProduct'];
  const sql = sqlQuery.commentInsert(idProduct,idUser,data.value,data.date)
  pool.query(sql,(err,results) => {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(201).json({message:'Add comment is success'})
  })
})

router.post("/user", verify, async (req, res) => {
  const idUser = await req.idUser;
  const sql = sqlQuery.getCommentByIdUser(idUser);
  pool.query(sql, function (err, results) {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.status(200).json(results.map(e => {
      return {
        ...e,
        detail:JSON.parse(e.detail)
      }
    }));
  });
});
router.delete("/delete/:idComment", (req, res) => {
  const idComment = req.params["idComment"];
  const sql = sqlQuery.commentDeleteByIdComment(idComment);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.json({ message: "Delete success" });
  });
});
router.delete("/list/delete", filterData, (req, res) => {
  const data = req.result;
  const list_data = data.list.join(",");
  const sql = sqlQuery.commentDeleteInList(list_data);
  pool.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({
        status:500,
        message: "A server error occurred. Please try again in 5 minutes.",
      });
      return;
    }
    res.json({ message: "Delete success" });
  });
});
export default router;
