import express from "express";
import dotenv from "dotenv";
import { poolConnectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/user.js";
import * as response from "../utils/handler.js"
import { filterData, verify, handleCheckRole } from "../middleware/middleware.js";
const router = express.Router();
dotenv.config();
const pool = poolConnectDB();
const errMessage = 'A server error occurred. Please try again in 5 minutes'
router.post('/', verify, (req, res) => {
    let idUser = req.idUser
    const sql = sqlQuery.getUser(idUser)
    pool.query('SET SESSION group_concat_max_len = 1000000;',(err,results) => {
        response.errResponseMessage(res,err,500,errMessage)
        pool.query(sql, function (err, results) {
            response.errResponseMessage(res,err,500,errMessage)
            res.json(results.map(e => {
                let cart = JSON.parse(e.cart);
                let order = JSON.parse(e.order);
                let address = JSON.parse(e.address);
                return {
                    nameUser:e.nameUser,
                    img:e.img,
                    email:e.email,
                    phone:e.phone,
                    role:e.role,
                    cart:cart?.every(c => Object.values(c).every(value => value === null)) || cart === null ? [] : cart,
                    order:order.every(c => Object.values(c).every(value => value === null)) ? [] : order,
                    address:address.every(c => Object.values(c).every(value => value === null)) ? [] : address.sort((a,b) => b.idAddress - a.idAddress)
                }}
            ));
        });
    })
})
router.get('/role/:role', (req, res) => {
    const role = req.params['role']
    const sql = sqlQuery.getRole(role);
    pool.query(sql, (err, results) => {
        response.errResponseMessage(res,err,500,errMessage)

        res.status(200).json(results);
    })
})
router.get('/all', (req, res) => {
    const sql = sqlQuery.getAllUser();
    pool.query(sql, (err, results) => {
        response.errResponseMessage(res,err,500,errMessage)

        res.status(200).json(results);
    })
})
router.get('/address',(req,res) => {
    const sql = sqlQuery.addressGetAll()
    pool.query(sql,(err,results) => {
        response.errResponseMessage(res,err,500,errMessage)

        res.status(200).json(results)
    })
})
router.post('/address/add',verify,filterData,(req,res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = sqlQuery.addAddress(idUser,data.type,data.detail);
    pool.query(sql,(err,results) => {
        response.errResponseMessage(res,err,500,errMessage)

        res.status(201).json({
            status:201,message:'Success',
            data:{detail:data.detail,idAddress:results.insertId,type:'Extra'}
        });
    })
})
router.patch('/address/change/detail',filterData,(req,res) => {
    const data = req.result;
    const sql = sqlQuery.updateAddress(data.idAddress,data.type);
    pool.query(sql,(err,results) => {
        response.errResponseMessage(res,err,500,errMessage)

        res.status(200).json({message:'Update success'});
    })
})
router.post('/address/change/type',verify,filterData,(req,res) => {
    const idUser= req.idUser;
    const data = req.result;
    const changeType = sqlQuery.addressRemoveDefault(idUser);
    const sql = sqlQuery.updateTypeAddress(data.idAddress,data.type);
    pool.query(changeType,(err,results) => {
        response.errResponseMessage(res,err,500,errMessage)

        pool.query(sql,(err,results) => {
            response.errResponseMessage(res,err,500,errMessage)
            response.successResponseMessage(res,200,'Update success')
        })
    })
})
router.delete('/address',filterData,(req,res) => {
    const listId = req.result.list;
    const sql = sqlQuery.deleteAddress(listId)
    pool.query(sql,(err,results) => {
        if(err){
            res.status(500).json({
                status:500,
                message:'A server error occurred. Please try again in 5 minutes.'
            })
            return
        }
        res.status(200).json({
            status:200,
            message:'Delete address is success'
        })
    })
})
router.post('/change/info', verify, filterData, async (req, res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = sqlQuery.changeUser(idUser, data.name, data.email, data.phone)
    const sqlCheckMail = sqlQuery.checkMail(data.email,idUser);
    pool.query(sqlCheckMail,(errCheck,resultsCheck) => {
        response.errResponseMessage(res,errCheck,500,errMessage)
        if(resultsCheck.length !== 0 ){
            res.status(401).json({status:401,message:'Email is already taken'})
            return
        }
        pool.query(sql, function (err, results) {
            response.errResponseMessage(res,err,500,errMessage)

            response.successResponseMessage(res,200,'User updated successfully')
        })
    })
})
router.post('/change/role/:newRole', verify, handleCheckRole, filterData, (req, res) => {
    const data = req.result;
    const newRole = req.params['newRole']
    const sql = sqlQuery.changeUser(data.idUser, newRole)
    pool.query(sql, function (err, results) {
       response.errResponseMessage(res,errCheck,500,errMessage)

       response.successResponseMessage(res,200,'Change role successfully')
    })
})
router.post('/change/list/role/:newRole', verify, handleCheckRole, filterData, (req, res) => {
    const data = req.result;
    const user_id_str = data.list.map(e => `'${e}'`).join(",")
    const newRole = req.params['newRole']
    const sql = sqlQuery.changeRoleInList(user_id_str, newRole)
    pool.query(sql, function (err, results) {
        response.errResponseMessage(res,errCheck,500,errMessage)

        response.successResponseMessage(res,200,'Change role successfully')
    })
})
export default router;