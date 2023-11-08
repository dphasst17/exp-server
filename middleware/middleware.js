import jwt from "jsonwebtoken";
import { poolConnectDB } from "../db/connect.js";
const pool = poolConnectDB();
export const filterData = (req, res, next) => {
    let dataObject = req.body;
    if (Array.isArray(dataObject)) {
        for (let i = 0; i < dataObject.length; i++) {
            if (typeof dataObject[i] === 'string') {
                dataObject[i] = dataObject[i].replace(/[\\\#$~%"*{}`]/g, '');
            }
        }
    } else {
        let keys = Object.keys(dataObject);
        for (let key of keys) {
            if (typeof dataObject[key] === 'string') {
                dataObject[key] = dataObject[key].replace(/[\\\#$~%"*{}`]/g, '');
            } else if (Array.isArray(dataObject[key])) {
                for (let i = 0; i < dataObject[key].length; i++) {
                    if (typeof dataObject[key][i] === 'string') {
                        dataObject[key][i] = dataObject[key][i].replace(/[\\\#$~%"*{}`]/g, '');
                    }
                }
            }
        }
    }
    req.result = dataObject;
    next();
}
export const verify  = (req,res,next) => {
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) return res.sendStatus(401);
    const token = authorizationHeader.split(" ")[1];
    if (!token) res.sendStatus(401);

    jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
        if (err) res.sendStatus(403);
        req.idUser = data.id;
        next();
    });
}
export const handleCheckRole = (req,res,next) => {
    const idUser = req.idUser;
    const sql = `SELECT * FROM login WHERE idUser = '${idUser}'`
    pool.query(sql,function(err,result){
        if(err){
            res.status(500).json({message:'Server error'});
            return;
        }
        const role = Number(result.map(e => e.role))
        if(role === 2){
            res.status(403).json({message:'You do not have sufficient permissions to access this resource'})
            return;
        }
        next()
    })
}