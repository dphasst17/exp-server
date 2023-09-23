import express from "express";
import dotenv from "dotenv";
import { connectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/user.js";
import { filterData, verify, handleCheckRole } from "../middleware/middleware.js";
const router = express.Router();
dotenv.config();
const con = connectDB();

router.post('/', verify, (req, res) => {
    let idUser = req.idUser
    const sql = sqlQuery.getUser(idUser)
    con.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            con.end();
            return;
        }
        res.json(results);
        con.end();
    });
})
router.get('/role/:role', (req, res) => {
    const role = req.params['role']
    const sql = sqlQuery.getRole(role);
    con.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            con.end();
            return;
        }
        res.status(200).json(results);
        con.end();
    })
})
router.get('/role/diff/:role', (req, res) => {
    const role = req.params['role']
    const sql = sqlQuery.getRoleDifferent(role);
    con.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            con.end();
            return;
        }
        res.status(200).json(results);
        con.end();
    })
})
router.post('/change/info', verify, filterData, async (req, res) => {
    const idUser = req.idUser;
    const data = req.result;
    const sql = sqlQuery.changeUser(idUser, data.name, data.email, data.phone)
    con.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            con.end();
            return;
        }
        res.status(200).json('User updated successfully');
        con.end();
    })
})
router.post('/change/role/:newRole', verify, handleCheckRole, filterData, (req, res) => {
    const data = req.result;
    const newRole = req.params['newRole']
    const sql = sqlQuery.changeUser(data.idUser, newRole)
    con.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            con.end();
            return;
        }
        res.status(200).json('Change role successfully');
        con.end();
    })
})
router.post('/change/list/role/:newRole', verify, handleCheckRole, filterData, (req, res) => {
    const data = req.result;
    const user_id_str = data.list.map(e => `'${e}'`).join(",")
    const newRole = req.params['newRole']
    const sql = sqlQuery.changeRoleInList(user_id_str, newRole)
    con.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            con.end();
            return;
        }
        res.status(200).json('Change role successfully');
        con.end();
    })
})
export default router;