import mysql from 'mysql2';
import dotenv from "dotenv";

dotenv.config();

export const poolConnectDB = () => {
    let pool = mysql.createPool({
        connectionLimit : 10,
        host :process.env.HOST,
        user:process.env.USER,
        password:process.env.PASSWORD,
        database:process.env.DB,
        port:process.env.PORT
    });
    return pool
}