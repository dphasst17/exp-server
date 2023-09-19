import express from "express";
import { connectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/comment.js"
import { verify,filterData } from "../middleware/middleware.js";
const router = express.Router();
const con = connectDB();

router.get('/',(req,res) => {
    const sql = sqlQuery.commentGetAll();
    con.query(sql,function (err,results){
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.status(200).json({data:results})
    })
})
router.get('/product/:idProduct',(req,res) => {
    const idProduct = req.params['idProduct'];
    const sql = sqlQuery.getCommentByIdProduct(idProduct);
    con.query(sql,function(err,results){
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.status(200).json(results)
    })
});
router.post('/user',verify,(req,res) => {
    const idUser = req.idUser;
    const sql = sqlQuery.getCommentByIdUser(idUser);
    con.query(sql,function(err,results){
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.status(200).json(results)
    })
})
router.delete('/delete/:idComment',(req,res) => {
    const idComment = req.params['idComment'];
    const sql = sqlQuery.commentDeleteByIdComment(idComment)
    con.query(sql,(err,results) => {
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.json({message:'Delete success'})
    })
})
router.delete('/list/delete',filterData,(req,res) => {
    const data = req.result;
    const list_data = data.join(",")
    const sql = sqlQuery.commentDeleteInList(list_data);
    con.query(sql,(err,results) => {
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
    })
})
export default router;