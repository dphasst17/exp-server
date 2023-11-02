import express from "express";
import { poolConnectDB } from "../db/connect.js";
import { transportsSelectAll,transportsSelectOne,transportInsert,
 transDetailInsertInList, transDetailDeleteAll, transDetailDeleteOne, transportsDelete, 
insertFailOrderDetail, insertFailOrder,checkCountProductInTrans, transDetailUpdateStatus, transportsSelectByUser, cartDeleteList} from "../db/statement/cart_transport.js";
import {billsInsertOne, billDetailInsert} from "../db/statement/bills.js"
import { verify,filterData } from "../middleware/middleware.js";
const router = express.Router();
const pool = poolConnectDB()
let dateObj = new Date();
let month = dateObj.getUTCMonth() + 1;
let year = dateObj.getUTCFullYear();
router.get('/',(req,res) => {
    const sql = transportsSelectAll();
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({
                status:500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
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
            res.status(500).json({
                status:500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
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
router.get('/user/get',verify,(req,res) => {
    const idUser = req.idUser;
    const sql = transportsSelectByUser(idUser);
    pool.query(sql,(err,results) => {
        if(err){
            res.status(500).json({
                status:500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
        res.status(200).json(results)
    })
})
router.post('/insert',verify,filterData,(req,res) => {
    const idUser = req.idUser;
    const data = req.result;
    const listIdCart = data.listIdCart.join(",")
    const idTrans = `${idUser}${month}${year}`
    const sql = transportInsert(idTrans,idUser,data.info);
    const sql2 = transDetailInsertInList(listIdCart,idTrans);
    const deleteCart = cartDeleteList(listIdCart)
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({
                status:500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
        pool.query(sql2,(err,results) => {
            if(err){
                res.status(500).json({
                    status:500,
                    message: "A server error occurred. Please try again in 5 minutes."
                });
                return;
            }
            pool.query(deleteCart,(err,results) => {
                if(err){
                    res.status(500).json({
                        
                        status:500,
                        message: "A server error occurred. Please try again in 5 minutes."
                    });
                    return;
                }
                res.status(201).json({message:'Insert success'});
            })
        })
    })
})
router.patch('/update/:idTrans',filterData,(req,res) => {
    const idTrans = req.params['idTrans'];
    const data = req.result;
    const sql = transDetailUpdateStatus(idTrans,data.status);
    res.json(sql)
    /* pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({
                status:500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
        res.status(201).json({message:'Update success'});
    }) */
})

router.delete('/delete/all/:idTrans',filterData,(req,res) => {
    const idTrans = req.params['idTrans'];
    const sql = transportsDelete(idTrans);
    const sqlDetail = transDetailDeleteAll(idTrans)
    pool.query(sql,function(err,results){
        if(err){
            res.status(500).json({
                status:500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
        pool.query(sqlDetail,(err,results) => {
            if(err){
                res.status(500).json({
                    status:500,
                    message: "A server error occurred. Please try again in 5 minutes."
                });
                return;
            } 
            res.status(201).json({message:'Update success'});
        })
    })
})
router.delete('/delete/detail',filterData,(req,res) => {
    const data = req.result;
    const idTrans = data.idTrans
    const idTransDetail = data.idTransDetail.join(",");
    const checkQuantity = checkCountProductInTrans(idTrans)
    const sql = transDetailDeleteOne(idTransDetail);
    pool.query(checkQuantity,(err,resultCheck) => {
        if(err){
            res.status(500).json({
                status:500,
                errCheck:err,message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
        let quantity = Number(resultCheck.flatMap(e => e.quantity))
        pool.query(sql, (err,results) => {
            if(err){
                res.status(500).json({
                    status:500,
                    errQuery1:err,message: "A server error occurred. Please try again in 5 minutes."
                });
                return;
            }
            if(quantity > 1){
                res.json({message:"Delete to success"})
            }else{
                const sqlTrans = transportsDelete(idTrans)
                pool.query(sqlTrans,(err,lastResult) => {
                    if(err){
                        res.status(500).json({
                            status:500,
                            errQuery2:err,message: "A server error occurred. Please try again in 5 minutes."
                        });
                        return;
                    }
                    res.json({message:"Delete to success"})
                })
            }
        })  
    })

})


router.post('/success',filterData,(req,res) => {
    const data = req.result;
    const idTrans = data.id;
    const sql = billsInsertOne(idTrans);
    const sqlDetail = billDetailInsert(idTrans)
    pool.query(sql,(err,results) => {
        if(err){
            res.status(500).json({
                status:500,
                errBill:err ,message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
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
        if(err){
            res.status(500).json({
                status:500,
                errFail:err,message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
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
