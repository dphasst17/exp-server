import express from "express";
import { poolConnectDB } from "../db/connect.js";
import {getCartById,getProductInList,cartInsert,cartUpdate,cartDeleteOne,cartDeleteList,cartDeleteAll} from '../db/statement/cart_transport.js'
import {filterData, verify} from "../middleware/middleware.js";
import * as response from "../utils/handler.js";
import * as message from "../utils/message.js";
const router = express.Router();
const pool = poolConnectDB();

router.get('/',verify,(req,res) => {
    const idUser = req.idUser;
    const sql = getCartById(idUser)
    pool.query(sql,function(err,results){
        response.errResponseMessage(res,err,500,message.err500Message())

        res.status(200).json(results.map(e => {
            return {
                ...e,
                detail:JSON.parse(e.detail)
            }
        }))
        
    })
})

router.post('/add',verify,filterData,(req,res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = cartInsert(data.idProduct,idUser,data.count)
    pool.query(sql,function(err,results){
        response.errResponseMessage(res,err,500,message.err500Message())

        let insertId = results.insertId;
        const updateIdCart = `SELECT * FROM carts WHERE idCart = ${insertId}`
        pool.query(updateIdCart,(err,resUpdate) => {
            response.errResponseMessage(res,err,500,message.err500Message())

            res.status(201).json({
                newId:resUpdate.map(e => {return {idCart:e.idCart,idProduct:e.idProduct}}),
                message:'Add product to cart success'
            })
        })
        
        
    })
})
router.post('/list',filterData,(req,res) => {
    const data = req.body;
    const cart_ids_str = data.list.join(",");
    const sql = getProductInList(cart_ids_str)
    pool.query(sql,function(err,results){
        response.errResponseMessage(res,err,500,message.err500Message())

        res.json(results)
        
    })
})
router.patch('/update',filterData,(req,res) => {
    const data = req.result;
    const idCart = Number(data.idCart);
    const count = Number(data.count)
    const sql = cartUpdate(idCart,count)
    pool.query(sql,function(err,results){
        response.errResponseMessage(res,err,500,message.err500Message())
        
        res.json({message:'Update cart is success'});
        
    })
    
})
router.delete('/delete/:idCart',filterData, (req, res) => {
    const idCart = Number(req.params['idCart'])
    const sql = cartDeleteOne(idCart)
    pool.query(sql,function(err,results){
        response.errResponseMessage(res,err,500,message.err500Message())

        res.json({ message: "Delete "+idCart+" success" });
        
    })
});
router.delete('/delete',verify,(req,res) => {
    const idUser = req.idUser
    const sql = cartDeleteAll(idUser)
    pool.query(sql,function(err,results){
        response.errResponseMessage(res,err,500,message.err500Message())

        res.json({ message: "Delete cart is success" });
        
    })
})
router.delete('/list/delete',filterData,(req,res) => {
    const data = req.body;
    const cart_ids_str = data.list.join(",");
    const sql = cartDeleteList(cart_ids_str)
    pool.query(sql,function(err,results){
        response.errResponseMessage(res,err,500,message.err500Message())

        res.json({ message: "Deleting cart products is successful" });
        
    })
})
export default router;
