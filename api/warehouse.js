import express from "express";
import { connectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/warehouse.js";
import { verify, filterData } from "../middleware/middleware.js";
const router = express.Router();
const con = connectDB()

router.get('/', (req, res) => {
    const sql = sqlQuery.getAll();
    con.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            con.end();
            return;
        }
        res.status(200).json(results);
        con.end();
    })
})
router.get('/total', (req, res) => {
    const sql = sqlQuery.getTotalProduct();
    con.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            con.end();
            return;
        }
        res.status(200).json(results);
        con.end();
    })
})
router.post('/status', filterData, (req, res) => {
    const data = req.result;
    const sql = sqlQuery.getWarehouseByStatus(data.status)
    con.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            con.end();
            return;
        }
        res.status(200).json(results);
        con.end();
    })
})
router.post('/insert', verify, filterData, (req, res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = sqlQuery.warehouseInsert(data.idProduct, idUser, data.date, data.count, data.status)
    con.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            con.end();
            return;
        }
        res.status(201).json({ message: 'Insert warehouse success' });
        con.end();
    })
})

export default router;
