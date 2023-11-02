import express from "express";
import { poolConnectDB } from "../db/connect.js";
import * as sqlQuery from "../db/statement/posts.js"
import {verify} from "../middleware/middleware.js";
import jsdom from "jsdom"
const { JSDOM } = jsdom;
const router = express.Router();
const pool = poolConnectDB();
router.get("/",(req,res) => {
    const sql = sqlQuery.postGetAll();
    pool.query(sql,(err,results) => {
        if(err){
            res.status(500).json({
                status:500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
        res.status(200).json(results.map(obj => {
            let dom = new JSDOM(obj.valuesPosts);
          
            let firstHeadingOrParagraph = dom.window.document.querySelector('h1, h2, h3, p').textContent; // Lấy nội dung của thẻ h1, h2, h3 hoặc p đầu tiên
            let firstImgSrc = dom.window.document.querySelector('img').getAttribute('src'); // Lấy src của thẻ img đầu tiên
          
            return {
                idPosts:obj.idPosts,
                title: firstHeadingOrParagraph,
                banner: firstImgSrc,
                dateAdded:new Date(obj.dateAdded).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                type:obj.typePosts,
                poster:obj.poster
              
            };
          }))
    })
})
router.post("/insert",verify,(req,res) => {
    const idUser = req.idUser
    const data = req.body;
    const sql = sqlQuery.postsInsert(data.date,data.type,idUser,data.value)
    pool.query(sql,(err,results) => {
        if(err){
            res.status(500).json({
                err:err,
                status:500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
        res.status(201).json({message:'Create posts is success'})
    })
})
router.get("/get/:idPosts",(req,res) => {
    const idPosts = req.params['idPosts']
    const sql = sqlQuery.postGetOne(idPosts)
    pool.query(sql,(err,results) => {
        if(err){
            res.status(500).json({
                status:500,
                message: "A server error occurred. Please try again in 5 minutes."
            });
            return;
        }
        res.status(200).json(results.map(e => {
            return {
                ...e,
                dateAdded:new Date(e.dateAdded).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            }
        }))
    })
})
export default router;