import express from "express";
import { connectDB } from "../db/connect.js";
import {getCartById,getProductInList,cartInsert,cartUpdate,cartDeleteOne,cartDeleteList,cartDeleteAll} from '../db/statement/cart_transport.js'
import {filterData, verify} from "../middleware/middleware.js";
const router = express.Router();
const con = connectDB();

router.get('/',verify,(req,res) => {
    const idUser = req.idUser;
    const sql = getCartById(idUser)
    con.query(sql,function(err,results){
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.json(results)
    })
})
router.post('/pay',verify,filterData,(req,res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = transportInsertInList(idUser,data);
    con.query(sql,function(err,results){
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.status(200).json({message:'Success'})
    })
})
router.post('/add',verify,filterData,(req,res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = cartInsert(data.id,idUser,data.count)
    con.query(sql,function(err,results){
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.status(201).json({message:'Add product to cart success'})
    })
})
router.post('/list',filterData,(req,res) => {
    const data = req.body;
    const cart_ids_str = data.list.join(",");
    const sql = getProductInList(cart_ids_str)
    con.query(sql,function(err,results){
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.json(results)
    })
})
router.patch('/change',filterData,(req,res) => {
    const data = req.result;
    const idCart = Number(data.cart);
    const count = Number(data.count)
    const sql = cartUpdate(idCart,count)
    con.query(sql,function(err,results){
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.json({message:'Update cart is success'})
    })
    
})
router.delete('/delete/:idCart',filterData, (req, res) => {
    const idCart = Number(req.params['idCart'])
    const sql = cartDeleteOne(idCart)
    con.query(sql,function(err,results){
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.json({ message: "Delete "+idCart+" success" });
    })
});
router.delete('/delete',verify,(req,res) => {
    const idUser = req.idUser
    const sql = cartDeleteAll(idUser)
    con.query(sql,function(err,results){
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.json({ message: "Delete cart is success" });
    })
})
router.delete('/list/delete',filterData,(req,res) => {
    const data = req.body;
    const cart_ids_str = data.list.join(",");
    const sql = cartDeleteList(cart_ids_str)
    con.query(sql,function(err,results){
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.json({ message: "Deleting cart products is successful" });
    })
})
export default router;
