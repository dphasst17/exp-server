import express from "express";
import dotenv from "dotenv";
import { poolConnectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/user.js";
import { filterData, verify } from "../middleware/middleware.js";
import * as response from "../utils/handler.js";
import * as message from "../utils/message.js"
import { handleSendMail } from "../utils/mail.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from "jsonwebtoken";
const router = express.Router();
dotenv.config();
const pool = poolConnectDB();

const updateLogin = (idUser, token) => {
    const sql = `UPDATE login SET rfToken = '${token}' WHERE idUser = '${idUser}'`;
    pool.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({
                status: 500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
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
const createPass = (length) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}
const encodePass = (password) => {
    const saltRound = 10
    const salt = bcrypt.genSaltSync(saltRound);
    return bcrypt.hashSync(password, salt);

}
/* If the login type is username password, it will transmit 3 information including username,password,'u'.
   If the login type is email, it will transmit as follows username,password,'e',name,idUser.

   props[0] => username. If the login type is email, the username will be email address 
   props[1] => password. If the login type is email,the password will be idUser
   props[2] => login type 'u' or 'e'
   props[3] => name user if the login type is email
   props[4] => idUser if the login type is email
*/
const handleRegister = (props, res) => {
    const pass_hash = encodePass(props.password)
    const newSql = props[2] === "u" ? sqlQuery.register(props.idUser, props.username, pass_hash, props.type) : sqlQuery.register(props.idUser, props.username, pass_hash, props.type)
    pool.query(newSql, function (err, results) {
        if (err) {
            res.status(500).json({
                err1: err,
                status: 500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
        let insertData = sqlQuery.insertUser(props.idUser, props.type === 'e' ? props.name : props.username, props.email)
        pool.query(insertData, function (errInsert, resultInsert) {
            if (errInsert) {
                res.status(500).json({
                    err2: err,
                    status: 500,
                    message: "A server error occurred. Please try again in 5 minutes."
                });
                return;
            }
            const resultObj = createToken(props.idUser)
            resultObj.role = 2
            res.status(201).json({ status: 201, data: resultObj })

        })
    })
}
router.post('/register', filterData, (req, res) => {
    const data = req.result;
    const username = data.username;
    const password = data.password;
    const email = data.email;
    const sql = sqlQuery.Login({ username: username, email: email, type: 'register' })
    pool.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({
                status: 500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
        if (results.length !== 0) {
            res.status(401).json({ status: 401, message: "Username or Email is already taken" });
            return
        } else {
            handleRegister({ idUser: username, username: username, password: password, type: 'u', email: email }, res)
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
        const sql = sqlQuery.Login({ username: email, type: 'user' });
        pool.query(sql, function (err, results) {
            if (err) {
                res.status(500).json({
                    status: 500,
                    message: "A server error occurred. Please try again in 5 minutes."
                });
                return;
            }
            if (results.length === 0) {
                const newId = email.split("@")[0];
                const nameUser = data.name;
                handleRegister({ idUser: newId, username: email, password: newId, type: 'e', name: nameUser, email: email }, res)
            }
            const idUser = results.map(e => e.idUser).toString()
            const role = Number(results.map(e => e.role))
            let resultObj = createToken(idUser)
            resultObj.role = role;
            res.status(200).json({ status: 200, data: resultObj });
        });
    } else {
        const sql = sqlQuery.Login({ username: id, type: 'user' });
        pool.query(sql, function (err, results) {
            if (err) {
                res.status(500).json({
                    status: 500,
                    message: "A server error occurred. Please try again in 5 minutes."
                });
                return;
            }
            if (results.length === 0) {
                res.status(401).json({ status: 401, message: "Username does not exist" })
                return
            }
            const pass_hash = results.map(e => e.password_hash).toString()
            isPassword = bcrypt.compareSync(password, pass_hash);
            if (!isPassword) {
                response.successResponseMessage(res, 401, 'Incorrect Password')
                return
            }

            const idUser = results.map(e => e.idUser).toString()
            const role = Number(results.map(e => e.role))
            const resultObj = createToken(idUser)
            resultObj.role = role;
            res.status(200).json({ status: 200, data: resultObj });
        })

    }

})
router.post('/admin/login', filterData, (req, res) => {
    const data = req.result;
    const username = data.username;
    const password = data.password;
    const sql = sqlQuery.Login({ username: username, type: 'admin' });
    pool.query(sql, (err, results) => {
        let isPassword
        if (err) {
            res.status(500).json({
                status: 500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
        if (results.length === 0) {
            res.status(401).json({ message: 'Username does not exist' })
        }
        const pass_hash = results.map(e => e.password_hash).toString()
        isPassword = bcrypt.compareSync(password, pass_hash);
        if (!isPassword) {
            res.status(401).json({ message: "Incorrect Password " })
        }
        const idUser = results.map(e => e.idUser).toString();
        const role = Number(results.map(e => e.role))
        const accessToken = jwt.sign({ id: idUser }, process.env.SECRET_KEY, { expiresIn: "1d" });
        const { exp: expAccess } = jwt.decode(accessToken);
        res.status(200).json({ accessToken: accessToken, exp: expAccess, role: role });
    })

})
router.post('/new/token', verify, (req, res) => {
    const result = req.idUser;
    const rfToken = req.headers['authorization'];
    const idUser = result.split("-")[0]
    let checkToken = false;
    const sql = `SELECT rfToken FROM login WHERE idUser = '${idUser}'`;
    pool.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({
                status: 500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
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
router.post('/forgot', filterData, (req, res) => {
    const data = req.result;
    const sql = sqlQuery.checkUsernameAndMail(data.username, data.email);
    pool.query(sql, (err, results) => {
        response.errResponseMessage(res, err, 500, message.err500Message())
        if (results.length === 0) {
            res.status(401).json({ status: 401, message: 'Username or email does not exits' })
            return
        }
        const newPass = createPass(10);
        const pass_hash = encodePass(newPass);
        const idUser = results[0].idUser;
        const sqlUpdatePass = sqlQuery.updatePassword(idUser, pass_hash)
        pool.query(sqlUpdatePass, (errUpdate, resUpdate) => {
            response.errResponseMessage(res, errUpdate, 500, message.err500Message())
            const resultData = {
                toMail: data.email,
                subject: "New password",
                content: `New password is ${newPass}`
            }
            handleSendMail(res, resultData)
        })
    })
})
router.post('/update/password', verify,filterData, (req, res) => {
    const idUser = req.idUser
    const data = req.result;
    const checkPass = sqlQuery.checkPassword(idUser);
    
    let isPassword;
    pool.query(checkPass,(err,results) => {
        response.errResponseMessage(res,err,500,message.err500Message())
        const pass_hash = results.map(e => e.password_hash).toString()
        isPassword = bcrypt.compareSync(data.currentPass, pass_hash);

        if (!isPassword) {
            response.successResponseMessage(res, 401, 'Incorrect Password')
            return
        }
        const newPass = encodePass(data.newPass)
        const updatePass = sqlQuery.updatePass(newPass,idUser)
        pool.query(updatePass,(errUpdate,resultsUpdate) => {
            response.errResponseMessage(res,errUpdate,500,message.err500Message())
            response.successResponseMessage(res,200,message.updateItemsMessage('password'))
        })
    })

})
export default router;