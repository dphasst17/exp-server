import express from "express";
import dotenv from "dotenv";
import { poolConnectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/order.js"
import * as response from "../utils/handler.js"
import * as message from "../utils/message.js"
const router = express.Router();
dotenv.config();
const pool = poolConnectDB();
router.get('/success',(req,res) => {
    const sql = sqlQuery.getAllOrderSuccess();
    pool.query(sql,(err,results) => {
        response.errResponseMessage(res,err,500,message.err500Message())
        const parseData = results.map(e => {
            return {
                ...e,
                dateBuy:response.formatDate(e.dateBuy),
                infoOrder:e.infoOrder === null ? '' : e.infoOrder
            }
        })
        response.successResponseData(res,200,parseData)
    })
})
router.get('/fail',(req,res) => {
    const sql = sqlQuery.getAllOrderFalse();
    pool.query(sql,(err,results) => {
        response.errResponseMessage(res,err,500,message.err500Message())
        response.successResponseData(res,200,results)
    })
})
router.get('/detail/:type/:id',(req,res) => {
    const type = req.params['type']
    const id = req.params['id']
    const sql = sqlQuery.getOrderDetail(type,id);
    pool.query(sql,(err,results) => {
        response.errResponseMessage(res,err,500,message.err500Message())
        const parseData = results.map(e => {
            return {
                ...e,
                dateBuy:response.formatDate(e.dateBuy),
                detail:JSON.parse(e.detail)
            }
        })
        response.successResponseData(res,200,parseData)
    })
})
export default router;
