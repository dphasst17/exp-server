import express from "express";
import { poolConnectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/warehouse.js";
import * as response from "../utils/handler.js";
import * as message from "../utils/message.js";
import { verify, filterData } from "../middleware/middleware.js";
const router = express.Router();
const pool = poolConnectDB()

router.get('/', (req, res) => {
    const sql = sqlQuery.getAll();
    pool.query(sql, function (err, results) {
        response.errResponseMessage(res,err,500,message.err500Message())
        
        res.status(200).json(results.map(e => {
            return {
                ...e,
                dateIOX:new Date(e.dateIOX).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            }
        }));
    })
})
router.get('/total', (req, res) => {
    const sql = sqlQuery.getTotalProduct();
    pool.query(sql, function (err, results) {
        response.errResponseMessage(res,err,500,message.err500Message())
        
        res.status(200).json(results);
    })
})
router.post('/status', filterData, (req, res) => {
    const data = req.result;
    const sql = sqlQuery.getWarehouseByStatus(data.status)
    pool.query(sql, function (err, results) {
        response.errResponseMessage(res,err,500,message.err500Message())
        
        res.status(200).json(results);
    })
})
router.post('/insert', verify, filterData, (req, res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = sqlQuery.warehouseInsert(data.idProduct, idUser, data.date, data.count, data.status)
    pool.query(sql, function (err, results) {
        response.errResponseMessage(res,err,500,message.err500Message())
        
        res.status(201).json({ message: 'Insert warehouse success' });
    })
})

export default router;
