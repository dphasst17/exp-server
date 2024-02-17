import express from "express";
import { poolConnectDB } from "../db/connect.js";
import { transportsSelectAll,transportsSelectOne,transportInsert,
 transDetailInsertInList, transDetailDeleteAll, transDetailDeleteOne, transportsDelete, 
insertFailOrderDetail, insertFailOrder,checkCountProductInTrans, transDetailUpdateStatus, transportsSelectByUser, cartDeleteList,
transUpdateShipper} from "../db/statement/cart_transport.js";
import {billsInsertOne, billDetailInsert} from "../db/statement/bills.js"
import { verify,filterData } from "../middleware/middleware.js";
import * as response from "../utils/handler.js";
import * as message from "../utils/message.js";
import crypto from "crypto"
const router = express.Router();
const pool = poolConnectDB()
let dateObj = new Date();
let month = dateObj.getUTCMonth() + 1;
let year = dateObj.getUTCFullYear();
const randomText = (length) => {
    return crypto.randomBytes(length).toString('hex');
}
router.get('/',(req,res) => {
    const sql = transportsSelectAll();
    pool.query(sql,function(err,results){
       response.errResponseMessage(res,err,500,message.err500Message())
        res.status(200).json(results.map(e => {
            return {
                ...e,
                /* detail:JSON.parse(e.detail) */
            }
        }));
    })
})
router.get('/get/:idTrans',(req,res) => {
    const idTrans = req.params['idTrans'];
    const sql = transportsSelectOne(idTrans);
    pool.query(sql,function(err,results){
       response.errResponseMessage(res,err,500,message.err500Message())
        res.status(200).json(results.map(e => {
            return {
                ...e,
                detail: JSON.parse(e.detail)
            }
        }));
    })
})
router.get('/user/get',verify,(req,res) => {
    const idUser = req.idUser;
    const sql = transportsSelectByUser(idUser);
    pool.query(sql,(err,results) => {
       response.errResponseMessage(res,err,500,message.err500Message())
       
        res.status(200).json(results.map(e => {
            const resultDetail = JSON.parse(e.detail)
            return {
                ...e,
                detail:resultDetail.every(c => Object.values(c).every(value => value === null)) ? [] : resultDetail
            }
        }))
    })
})
router.post('/insert',verify,filterData,(req,res) => {
    const idUser = req.idUser;
    const data = req.result;
    const listIdCart = data.listIdCart.join(",")
    const textRandom = randomText(4)
    const idTrans = `${idUser}${month}${year}-${textRandom}`
    const sql = transportInsert(idTrans,idUser,data.info);
    const sql2 = transDetailInsertInList(listIdCart,idTrans);
    const deleteCart = cartDeleteList(listIdCart)
    pool.query(sql,function(err,results){
       response.errResponseMessage(res,err,500,message.err500Message())
        pool.query(sql2,(err,results) => {
            response.errResponseMessage(res,err,500,message.err500Message())

            pool.query(deleteCart,(errDel,results) => {
                response.errResponseMessage(res,errDel,500,message.err500Message())

                response.successResponseMessage(res,200,'Order success')
            })
        })
    })
})
router.patch('/update/:idTrans',filterData,(req,res) => {
    const idTrans = req.params['idTrans'];
    const data = req.result;
    const sql = transDetailUpdateStatus(idTrans,data.status);
    pool.query(sql,function(err,results){
       response.errResponseMessage(res,err,500,message.err500Message())
       response.successResponseMessage(res,200,message.updateItemsMessage('status'))
    })
})
router.put('/update/shipper/:idTrans',filterData,(req,res) => {
    const idTrans = req.params['idTrans'];
    const data = req.result;
    const sql = transUpdateShipper(idTrans,data.shipper);
    pool.query(sql,function(err,results){
       response.errResponseMessage(res,err,500,message.err500Message())
       response.successResponseMessage(res,200,message.updateItemsMessage('shipper'))
    })
})

router.delete('/delete/all/:idTrans',filterData,(req,res) => {
    const idTrans = req.params['idTrans'];
    const sql = transportsDelete(idTrans);
    const sqlDetail = transDetailDeleteAll(idTrans)
    pool.query(sql,function(err,results){
       response.errResponseMessage(res,err,500,message.err500Message())
        pool.query(sqlDetail,(err,results) => {
            response.errResponseMessage(res,err,500,message.err500Message())

            response.successResponseMessage(res,200,message.removeItemsMessage('product'))
        })
    })
})
//delete one or multi product in transports
router.delete('/delete/detail',filterData,(req,res) => {
    const data = req.result;
    const idTrans = data.idTrans
    const idTransDetail = data.idTransDetail.join(",");
    const checkQuantity = checkCountProductInTrans(idTrans)
    const sql = transDetailDeleteOne(idTransDetail);
    /* check total product in transport detail 
        if total > 1 => delete product
        if total ==== 1 => delete product and delete order in transport table
    */
    pool.query(checkQuantity,(err,resultCheck) => {
        response.errResponseMessage(res,err,500,message.err500Message())

        let quantity = Number(resultCheck.flatMap(e => e.quantity))
        pool.query(sql, (err,results) => {
            response.errResponseMessage(res,err,500,message.err500Message())
            if(quantity > 1){
                response.successResponseMessage(res,200,message.removeItemsMessage('product'))
                return
            }
            
            if(quantity === 1){
                const sqlTrans = transportsDelete(idTrans)
                pool.query(sqlTrans,(errTrans,lastResult) => {
                    response.errResponseMessage(res,err,500,message.err500Message())
                    response.successResponseMessage(res,200,message.removeItemsMessage('order'))
                })
            }
        })  
    })

})

/* Successful delivery */
router.post('/success',filterData,(req,res) => {
    const data = req.result;
    const idTrans = data.id;
    const date = new Date().toISOString().split('T')[0]
    const sql = billsInsertOne(idTrans,date);
    const sqlDetail = billDetailInsert(idTrans)
    pool.query(sql,(err,results) => {
        response.errResponseMessage(res,err,500,message.err500Message())

        pool.query(sqlDetail,(err,results) => {
            if(err){
                res.status(500).json({
                    status:500,
                    errBillDetail:err ,message: "A server error occurred. Please try again in 5 minutes."
                });
                return;
            }
            const sqlDeleteDetail = transDetailDeleteAll(idTrans);
            const sqlDelete = transportsDelete(idTrans);
            pool.query(sqlDeleteDetail,(err,results) => {
                if(err){
                    res.status(500).json({
                        status:500,
                        errDel:err ,message: "A server error occurred. Please try again in 5 minutes."
                    });
                    return;
                }
                pool.query(sqlDelete,(err,resDetail) => {
                    if(err){
                        res.status(500).json({
                            status:500,
                            errDelDetail:err ,message: "A server error occurred. Please try again in 5 minutes."
                        });
                        return;
                    }
                    res.status(201).json({message:'Success'});
                })
            })
        })
    })
})

router.post('/fail',filterData,(req,res) => {
    const data = req.result;
    const idTrans = data.id;
    const sqlFail = insertFailOrder(idTrans);
    const sqlFailDetail = insertFailOrderDetail(idTrans);
    pool.query(sqlFail,(err,resFail) => {
        response.errResponseMessage(res,err,500,message.err500Message())
        
        pool.query(sqlFailDetail,(err,resFailDetail) => {
            if(err){
                res.status(500).json({
                    status:500,
                    errFailDetail:err,message: "A server error occurred. Please try again in 5 minutes."
                });
                return;
            }
            const sqlDeleteDetail = transDetailDeleteAll(idTrans);
            const sqlDelete = transportsDelete(idTrans);
            pool.query(sqlDeleteDetail,(err,resDel) => {
                if(err){
                    res.status(500).json({
                        status:500,
                        errDel:err,message: "A server error occurred. Please try again in 5 minutes."
                    });
                    return;
                }
                pool.query(sqlDelete,(err,resDelDetail) => {
                    if(err){
                        res.status(500).json({
                            status:500,
                            errDelDetail:err,message: "A server error occurred. Please try again in 5 minutes."
                        });
                        return;
                    }
                    res.status(201).json({message:'Success'});
                })
            })
        })
    })
})

export default router;
