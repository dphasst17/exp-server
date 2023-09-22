import express from "express";
import { connectDB } from "../db/connect.js";
import { transportsSelectAll,transportsSelectOne,transportsSelectList,transportInsert,transportInsertInList,transportsUpdateStatusOne,
transportsUpdateList,transportsDeleteOne,transportsDeleteList} from "../db/statement/cart_transport.js";
import {billInsertOne,billInsertList} from "../db/statement/bills.js"
import { verify,filterData } from "../middleware/middleware.js";
const router = express.Router();
const con = connectDB()

router.get('/',(req,res) => {
    const sql = transportsSelectAll();
    con.query(sql,function(err,results){
        if(err) throw err;
        res.status(200).json(results)
    })
})
router.get('/get/:idTrans',(req,res) => {
    const idTrans = req.params['idTrans'];
    const sql = transportsSelectOne(idTrans);
    con.query(sql,function(err,results){
        if(err) throw err
        res.status(200).json(results)
    })
})
router.post('/insert',verify,filterData,(req,res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = transportInsert(idUser,data.idProduct,data.count,data.name,data.phone,data.address,data.costs,data.method)
    con.query(sql,function(err,results){
        if(err) throw err
        res.status(201).json({message:'Insert success'})
    })
})
router.patch('/update/:idTrans',filterData,(req,res) => {
    const idTrans = req.params['idTrans'];
    const data = req.result;
    const sql = transportsUpdateStatusOne(idTrans,data.status);
    con.query(sql,function(err,results){
        if(err) throw err
        res.status(201).json({message:'Update success'})
    })
})
router.delete('/delete/:idTrans',filterData,(req,res) => {
    const idTrans = req.params['idTrans'];
    const sql = transportsDeleteOne(idTrans);
    con.query(sql,function(err,results){
        if(err) throw err
        res.status(201).json({message:'Update success'})
    })
})
router.post('/list/get',filterData,(req,res) => {
    const data = req.result;
    const cart_ids_str = data.list.join(",");
    const sql = transportsSelectList(cart_ids_str);
    con.query(sql,function(err,results){
        if(err) throw err
        res.status(200).json(results)
    })
})
router.post('/list/insert',verify,filterData,(req,res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = transportInsertInList(idUser,data)
    con.query(sql,function(err,results){
        if(err) throw err
        res.status(201).json({message:'Insert to success'})
    })
})
router.patch('/list/update/:status',filterData,(req,res) => {
    let status;
    const param = req.params['status'];
    switch(param){
        case '1':
            status = 'Chờ xác nhận';
            break;
        case '2':
            status = 'Đang chuẩn bị đơn hàng'
            break;
        case '3':
            status = 'Đang vận chuyển'
            break;
        default:
            break;
    }
    const data = req.result;
    const cart_ids_str = data.list.join(",");
    const sql = transportsUpdateList(status,cart_ids_str);
    con.query(sql,function(err,results){
        if(err) throw err
        res.status(201).json({message:'Update success'})
    })
})
router.delete('/list/delete',filterData,(req,res) => {
    const data = req.result;
    const cart_ids_str = data.list.join(",");
    const sql = transportsDeleteList(cart_ids_str);
    con.query(sql,function(err,results){
        if(err) throw err
        res.status(201).json({message:'Update success'})
    })
})
router.post('/success',filterData,(req,res) => {
    const data = req.result;
    const idTrans = data.id;
    const date = data.date
    const sql = billInsertOne(idTrans,date);
    con.query(sql,(err,results) => {
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.status(201).json({message:'Success'})
    })
})
router.post('/list/success',filterData,(req,res) => {
    const data = req.result;
    const listId = data.list
    const date = data.date;
    const newListId = listId.join(",")
    const sql = billInsertList(newListId,date);
    con.query(sql,(err,results) => {
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.status(201).json({message:'Success'})
    })
})
/* router.post('/fail',filterData,(req,res) => {}) */

export default router;
