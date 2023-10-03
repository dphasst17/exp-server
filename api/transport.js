import express from "express";
import { poolConnectDB } from "../db/connect.js";
import { transportsSelectAll,transportsSelectOne,transportsSelectList,transportInsert,transportsUpdateStatusOne,
transportsUpdateList,transportsDeleteOne,transportsDeleteList, transDetailInsertInList, transDetailInsert} from "../db/statement/cart_transport.js";
import {billInsertOne,billInsertList} from "../db/statement/bills.js"
import { verify,filterData } from "../middleware/middleware.js";
const router = express.Router();
const pool = poolConnectDB()
let dateObj = new Date();
let month = dateObj.getUTCMonth() + 1; //tháng từ 1-12
let year = dateObj.getUTCFullYear();
router.get('/',(req,res) => {
    const sql = transportsSelectAll();
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
            return;
        };
        res.status(200).json(results.map(e => {
            return {
                ...e,
                detail:JSON.parse(e.detail)
            }
        }));
    })
})
router.get('/get/:idTrans',(req,res) => {
    const idTrans = req.params['idTrans'];
    const sql = transportsSelectOne(idTrans);
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
            return;
        }
        res.status(200).json(results.map(e => {
            return {
                ...e,
                detail: JSON.parse(e.detail)
            }
        }));
    })
})
router.post('/insert',verify,filterData,(req,res) => {
    const idUser = req.idUser;
    const data = req.result;
    const idTrans = `${idUser}${month}${year}`
    const sql = transportInsert(idTrans,idUser,data);
    const sql2 = transDetailInsert(idTrans)
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
            return;
        }
        pool.query(sql2,(err,results) => {
            if(err){
                res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
                return;
            }
            res.status(201).json({message:'Insert success'});
        })
    })
})
router.patch('/update/:idTrans',filterData,(req,res) => {
    const idTrans = req.params['idTrans'];
    const data = req.result;
    const sql = transportsUpdateStatusOne(idTrans,data.status);
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
            return;
        }
        res.status(201).json({message:'Update success'});
    })
})
router.delete('/delete/:idTrans',filterData,(req,res) => {
    const idTrans = req.params['idTrans'];
    const sql = transportsDeleteOne(idTrans);
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
            return;
        }
        res.status(201).json({message:'Update success'});
    })
})
router.post('/list/get',filterData,(req,res) => {
    const data = req.result;
    const cart_ids_str = data.list.map(id => `'${id}'`).join(",");
    const sql = transportsSelectList(cart_ids_str);
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
            return;
        }
        res.status(200).json(results.map(e => {
            return {
                ...e,
                detail:JSON.parse(e.detail)
            }
        }));
    })
})
router.post('/list/insert',verify,filterData,(req,res) => {
    const idUser = req.idUser;
    const data = req.result;
    const idTrans = `${idUser}${month}${year}`
    const sql2 = transDetailInsertInList(idTrans,data);
    const sql = transportInsert(idTrans,idUser,data)
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
            return;
        }
        pool.query(sql2,(err,result) => {
            if(err){
                res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
                return;
            }
            res.status(201).json({message:'Insert to success'});
        })
    })
    res.json(sql);
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
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
            return;
        }
        res.status(201).json({message:'Update success'});
    })
})
router.delete('/list/delete',filterData,(req,res) => {
    const data = req.result;
    const cart_ids_str = data.list.join(",");
    const sql = transportsDeleteList(cart_ids_str);
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
            return;
        }
        res.status(201).json({message:'Update success'});
    })
})
router.post('/success',filterData,(req,res) => {
    const data = req.result;
    const idTrans = data.id;
    const date = data.date
    const sql = billInsertOne(idTrans,date);
    pool.query(sql,(err,results) => {
        if(err){
            res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
            return;
        }
        res.status(201).json({message:'Success'});
    })
})
router.post('/list/success',filterData,(req,res) => {
    const data = req.result;
    const listId = data.list
    const date = data.date;
    const newListId = listId.join(",")
    const sql = billInsertList(newListId,date);
    pool.query(sql,(err,results) => {
        if(err){
            res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."});
            return;
        }
        res.status(201).json({message:'Success'});
    })
})
router.post('/fail',filterData,(req,res) => {
    const data = req.result
})

export default router;
