import express from "express";
import { poolConnectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/statistical.js"
const router = express.Router();
const pool = poolConnectDB()

router.get('/bestselling',(req,res) => {
    const sql = sqlQuery.bestselling();
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
router.get('/view',(req,res) => {
    const sql = sqlQuery.topView();
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
router.get('/revenue/type',(req,res) => {
    const sql = sqlQuery.revenue_by_type();
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
router.get('/revenue/total',(req,res) => {
    const sql = sqlQuery.total_revenue();
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

export default router