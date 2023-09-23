import express from "express";
import dotenv from "dotenv";
import { poolConnectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/user.js";
import { filterData, verify } from "../middleware/middleware.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
const router = express.Router();
dotenv.config();
const pool = poolConnectDB();

const updateLogin = (idUser, token) => {
    const sql = `UPDATE login SET rfToken = '${token}' WHERE idUser = '${idUser}'`;
    pool.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            return;
        }
    })
}
const createToken = (idUser) => {
    const accessToken = jwt.sign({ id: idUser }, process.env.SECRET_KEY, { expiresIn: "600s", });
    const refreshToken = jwt.sign({ id: `${idUser}-token` }, process.env.SECRET_KEY, { expiresIn: "5d" });
    const { exp: expAccess } = jwt.decode(accessToken);
    const { exp: expRefresh } = jwt.decode(refreshToken);
    updateLogin(idUser, refreshToken);
    return { accessToken, refreshToken, expAccess, expRefresh }
}

/* If the login type is username password, it will transmit 3 information including username,password,'u'.
   If the login type is email, it will transmit as follows username,password,'e',name,idUser.

   props[0] => username. If the login type is email, the username will be email address 
   props[1] => password. If the login type is email,the password will be idUser
   props[2] => login type 'u' or 'e'
   props[3] => name user if the login type is email
   props[4] => idUser if the login type is email
*/
const handleRegister = (...props) => {
    const saltRound = 10
    const salt = bcrypt.genSaltSync(saltRound);
    const pass_hash = bcrypt.hashSync(props[1], salt);
    const newSql = props[2] === "u" ? sqlQuery.register(props[0], props[0], pass_hash, props[2]) : sqlQuery.register(props[4], props[0], pass_hash, props[2])
    pool.query(newSql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            return;
        }
        let insertData = props[2] === "u" ? sqlQuery.insertUserTypeU(props[0]) : sqlQuery.insertUserTypeE(props[4], props[3], props[0])
        pool.query(insertData, function (err, result) {
            if (err) throw err
        })
    })
}

router.post('/register', filterData, (req, res) => {
    const data = req.result;
    const username = data.username;
    const password = data.password;
    const sql = sqlQuery.login(username)
    pool.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            return;
        }
        if (results.length !== 0) {
            res.status(400).json("Username already taken");
        } else {
            handleRegister(username, password, 'u')
            const resultObj = createToken(username)
            res.status(201).json(resultObj)
        }
    })

})

router.post('/login', filterData, (req, res) => {
    const data = req.result;
    const id = data.username;
    const password = data.password;
    const email = data.email;
    let isPassword
    if (email) {
        let resultObj;
        const sql = sqlQuery.login(email);
        pool.query(sql, function (err, results) {
            if (err) {
                res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
                return;
            }
            if (results.length === 0) {
                const newId = email.split("@")[0];
                const nameUser = data.name;
                handleRegister(email, newId, 'e', nameUser, newId)
                resultObj = createToken(newId)
            }
            const idUser = results.map(e => e.idUser).toString()
            const role = Number(results.map(e => e.role))
            resultObj = createToken(idUser)
            resultObj.role = role;
            res.status(200).json(resultObj);
        });
    } else {
        const sql = sqlQuery.login(id);
        pool.query(sql, function (err, results) {
            if (err) {
                res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
                return;
            }
            const pass_hash = results.map(e => e.password_hash).toString()
            isPassword = bcrypt.compareSync(password, pass_hash);

            if (results.length === 0) {
                res.status(401).json("Username does not exist")
            }
            if (!isPassword) {
                res.status(401).send("Incorrect Password ")
            }
            const idUser = results.map(e => e.idUser).toString()
            const role = Number(results.map(e => e.role))
            const resultObj = createToken(idUser)
            resultObj.role = role;
            res.status(200).json(resultObj);
        })

    }

})
router.post('/new/token', verify, (req, res) => {
    const result = req.idUser;
    const rfToken = req.headers['authorization'];
    const idUser = result.split("-")[0]
    let checkToken = false;
    const sql = `SELECT rfToken FROM login WHERE idUser = '${idUser}'`;
    pool.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: "A server error occurred. Please try again in 5 minutes." });
            return;
        }
        results.map(e => {
            if (rfToken.includes(e.rfToken)) {
                checkToken = true
            }
        })
        if (checkToken === true) {
            const accessToken = jwt.sign({ id: idUser }, process.env.SECRET_KEY, { expiresIn: "600s", });
            const { exp: expAccess } = jwt.decode(accessToken);
            res.json({ accessToken, expAccess })
        }
    })

})
router.post('/forgot', filterData, (req, res) => { })
export default router;