//In case of successful order delivery
export const billInsertOne = (idTrans,date) => {
    const sql = `INSERT INTO bills(idUser,idProduct,dateBuy,countProduct,totalProduct) 
    SELECT o.idUser,o.idProduct,('${date}')AS dateBuy,o.countProduct,(o.countProduct * p.price)AS totalProduct 
    FROM transports o JOIN products p ON o.idProduct = p.idProduct WHERE idTrans = ${idTrans};`
    return sql;
}
export const billInsertList = (list,date) => {
    const sql = `INSERT INTO bills(idUser,idProduct,dateBuy,countProduct,totalProduct) 
    SELECT o.idUser,o.idProduct,('${date}')AS dateBuy,o.countProduct,(o.countProduct * p.price)AS totalProduct 
    FROM transports o JOIN products p ON o.idProduct = p.idProduct WHERE idTrans IN (${list});`
    return sql;
}
export const billDeleteOne = (idBill) => {
    const sql = `DELETE FROM bills WHERE idBill = ${idBill}`;
    return sql;
}
export const billDeleteList = (list) => {
    const sql = `DELETE FROM bills WHERE idBill IN (${list})`;
    return sql;
}

//In case of failure to ship an order