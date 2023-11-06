import express from "express";
import dotenv from "dotenv";
import { poolConnectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/user.js";
import { filterData, verify, handleCheckRole } from "../middleware/middleware.js";
const router = express.Router();
dotenv.config();
const pool = poolConnectDB();

router.post('/', verify, (req, res) => {
    let idUser = req.idUser
    const sql = sqlQuery.getUser(idUser)
    pool.query('SET SESSION group_concat_max_len = 1000000;',(err,results) => {
        if (err) {
            res.status(500).json({ 
                err:err,
                status:500,
                message: "A server error occurred. Please try again in 5 minutes." 
            });
            return;
        }
        pool.query(sql, function (err, results) {
            if (err) {
                res.status(500).json({ 
                    err:err,
                    status:500,
                    message: "A server error occurred. Please try again in 5 minutes." 
                });
                return;
            }
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
                    cart:cart.every(c => Object.values(c).every(value => value === null)) ? [] : cart,
                    order:order.every(c => Object.values(c).every(value => value === null)) ? [] : order,
                    address:address.every(c => Object.values(c).every(value => value === null)) ? [] : address
                }}
            ));
        });
    })
})
router.get('/role/:role', (req, res) => {
    const role = req.params['role']
    const sql = sqlQuery.getRole(role);
    pool.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ 
                status:500,
                message: "A server error occurred. Please try again in 5 minutes." 
            });
            return;
        }
        res.status(200).json(results);
    })
})
router.get('/all', (req, res) => {
    const sql = sqlQuery.getAllUser();
    pool.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ 
                status:500,
                message: "A server error occurred. Please try again in 5 minutes." 
            });
            return;
        }
        res.status(200).json(results);
    })
})
router.get('/address',(req,res) => {
    const sql = sqlQuery.addressGetAll()
    pool.query(sql,(err,results) => {
        if (err) {
            res.status(500).json({ 
                status:500,
                message: "A server error occurred. Please try again in 5 minutes." 
            });
            return;
        }
        res.status(200).json(results)
    })
})
router.post('/address/add',verify,filterData,(req,res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = sqlQuery.addAddress(idUser,data.type,data.detail);
    pool.query(sql,(err,results) => {
        if (err) {
            res.status(500).json({ 
                status:500,
                message: "A server error occurred. Please try again in 5 minutes." 
            });
            return;
        }
        res.status(201).json({message:'Success'});
    })
})
router.patch('change/address/detail',filterData,(req,res) => {
    const data = req.result;
    const sql = sqlQuery.updateAddress(data.idAddress,data.detail);
    pool.query(sql,(err,results) => {
        if (err) {
            res.status(500).json({ 
                status:500,
                message: "A server error occurred. Please try again in 5 minutes." 
            });
            return;
        }
        res.status(200).json({message:'Update success'});
    })
})
router.patch('change/address/type',filterData,(req,res) => {
    const data = req.result;
    const sql = sqlQuery.updateTypeAddress(data.idAddress,data.type);
    pool.query(sql,(err,results) => {
        if (err) {
            res.status(500).json({ 
                status:500,
                message: "A server error occurred. Please try again in 5 minutes." 
            });
            return;
        }
        res.status(200).json({message:'Update success'});
    })
})
router.post('/change/info', verify, filterData, async (req, res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = sqlQuery.changeUser(idUser, data.name, data.email, data.phone)
    pool.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ 
                status:500,
                message: "A server error occurred. Please try again in 5 minutes." 
            });
            return;
        }
        res.status(200).json('User updated successfully');
    })
})
router.post('/change/role/:newRole', verify, handleCheckRole, filterData, (req, res) => {
    const data = req.result;
    const newRole = req.params['newRole']
    const sql = sqlQuery.changeUser(data.idUser, newRole)
    pool.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ 
                status:500,
                message: "A server error occurred. Please try again in 5 minutes." 
            });
            return;
        }
        res.status(200).json('Change role successfully');
    })
})
router.post('/change/list/role/:newRole', verify, handleCheckRole, filterData, (req, res) => {
    const data = req.result;
    const user_id_str = data.list.map(e => `'${e}'`).join(",")
    const newRole = req.params['newRole']
    const sql = sqlQuery.changeRoleInList(user_id_str, newRole)
    pool.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ 
                status:500,
                message: "A server error occurred. Please try again in 5 minutes." 
            });
            return;
        }
        res.status(200).json('Change role successfully');
    })
})
export default router;