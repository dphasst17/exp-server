import mysql from 'mysql';
import dotenv from "dotenv";

dotenv.config();
export const connectDB = () => {
    let con = mysql.createConnection({
        host :process.env.HOST,
        user:process.env.USER,
        password:process.env.PASSWORD,
        database:process.env.DB
    });
    return con;
};

export const poolConnectDB = () => {
    let pool = mysql.createPool({
        connectionLimit : 10,
        host :process.env.HOST,
        user:process.env.USER,
        password:process.env.PASSWORD,
        database:process.env.DB
    });
    return pool
}