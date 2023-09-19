import express from "express";
import dotenv from "dotenv";
import { connectDB } from "../db/connect.js";
import { filterData } from "../middleware/middleware.js";
import * as sqlQuery from "../db/statement/product.js";
const router = express.Router();
dotenv.config();
const con = connectDB()

router.get('/search/:keyword',(req, res) => {
    const keyboard = req.params['keyword']
    let sql = sqlQuery.searchProduct(keyboard)
    con.query(sql, function(err, results) {
        if (err) throw err;
        res.send(results);
    });
})

router.get('/',(req,res) => {
    let sql = sqlQuery.getAll();
    con.query(sql, function(err, results) {
        if (err) throw err;
        res.json(results);
    });

})

router.get('/new',(req,res) => {
    let sql = sqlQuery.getNewProduct()
    con.query(sql, function(err, results) {
        if (err) throw err;
        res.send(results);
    });
})

router.get('type/:nameType',(req,res) => {
    const nameType = req.params['nameType'];
    let sql;
    switch(nameType){
        case 'laptop':
            sql = sqlQuery.getProductByType(1);
            break;
        case 'keyboard':
            sql = sqlQuery.getProductByType(2);
            break;
        case 'monitor':
            sql = sqlQuery.getProductByType(3);
            break;
        case 'memory':
            sql = sqlQuery.getProductByType(4);
            break;
        case 'storage':
            sql = sqlQuery.getProductByType(5);
            break;
        case 'vga':
            sql = sqlQuery.getProductByType(6);
            break;
        case 'mouse':
            sql = sqlQuery.getProductByType(7);
            break;
        default:
            sql = false;
            break;
    }
    if(sql === false){
        res.status(404).send("Url not found")
    }else{
        con.query(sql, function(err, results) {
            if (err) throw err;
            res.send(results.map(e => {
                delete e.id
                return e;
            }));
        });
    }
})

router.get('detail/:idType/:idProduct',(req,res) => {
    const idType = req.params['idType'];
    const idProduct = req.params['idProduct'];
    let sql = sqlQuery.getDetail(idType,idProduct)
    con.query(sql, function(err, results) {
        if (err) throw err;
        res.send(results.map(e => {
            delete e.id
            return e
        }));
    });
})

router.post('/insert',filterData,(req,res) => {
    const data = req.result;
    const folder = data.folder;
    const productInf = data.product;
    const queryCheck = false;
    const resultProduct = productInf.map((e,i) => {
        if(i === 2){
            return "'" + process.env.AWS_URL_IMG + "/" + folder + "/" + e + "'"
        }else{
            return /[a-zA-Z]/.test(e) ? "'" + e + "'" : e
        }
    }).toString()
    const resultDetail = data.detail.map((item, index) => {
        if (/[a-zA-Z]/.test(item)) {
            return "'" + item + "'";
        } else {
            return item;
        }
    }).toString();
    const sqlProduct = sqlQuery.productInsertInfo(resultProduct);
    
    con.query(sqlProduct,(err,results) => {
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        const idProduct = results.insertId
        const lastResult = `${idProduct},${resultDetail}`
        const sqlDetail = sqlQuery.productInsertDetail(lastResult);
        con.query(sqlDetail,(err,results) => {
            if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
            return queryCheck = true
        });
    });
    
    queryCheck === true && res.status(201).json({message:"Add product to success"})
})

router.put('/update/:idProduct',filterData,(req,res) => {
    const data = req.result;
    const idProduct = req.params['idProduct']
    const folder = data.folder;
    const resultProduct = data.product.map((e,i) => {
        if(i === 2){
            return "'" + process.env.AWS_URL_IMG + "/" + folder + "/" + e + "'"
        }else{
            return /[a-zA-Z]/.test(e) ? "'" + e + "'" : e
        }
    }).toString()
    const sql = sqlQuery.productUpdate(idProduct,resultProduct)

})
router.put('/detail/update/:idType/:idProduct',filterData,(req,res) => {
    const data = req.result;
    const idType = req.params['idType'];
    const idProduct = req.params['idProduct'];
    const resultDetail = data.detail.map(e => {
        if (/[a-zA-Z]/.test(item)) {
            return "'" + item + "'";
        } else {
            return item;
        }
    })
    const sql = sqlQuery.productUpdateDetail(idType,idProduct,resultDetail);
    con.query(sql,(err,results) => {
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.status(204).json({message:'Update product to success'})
    })
})
router.delete('/delete/:idProduct',filterData,(req,res) => {
    const idProduct = req.params['idProduct'];
    const sql = sqlQuery.productDelete(idProduct)
    con.query(sql,(err,results) => {
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.status(200).json({message:'Delete product to success'})
    })
})
router.delete('/list/delete',filterData,(req,res) => {
    const data = req.result;
    const list_cart = data.join(",");
    const sql = sqlQuery.productDeleteList(list_cart)
    con.query(sql,(err,results) => {
        if(err){res.status(500).json({message: "A server error occurred. Please try again in 5 minutes."})};
        res.status(200).json({message:'Delete success'})
    })

})
export default router;