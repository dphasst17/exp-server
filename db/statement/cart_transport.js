/* sql statement for cart table */
export const getCartById = (idUser) => {
    const sql = `SELECT c.idUser,
    CONCAT('[', GROUP_CONCAT(JSON_OBJECT('idCart',c.idCart,'idProduct', c.idProduct, 'nameProduct', p.nameProduct, 'price', p.price,'imgProduct',p.imgProduct)), ']') AS detail
    FROM carts c JOIN products p ON c.idProduct = p.idProduct WHERE idUser = '${idUser}'`;
    return sql;
}
export const getProductInList = (list) => {
    const sql = `SELECT c.*,p.nameProduct,p.price,p.imgProduct FROM carts c JOIN products p ON c.idProduct = p.idProduct WHERE idCart IN (${list})`
    return sql;
}
export const cartInsert = (idProduct,idUser,count) => {
    const sql = `INSERT INTO carts (idProduct,idUser,countProduct)VALUES(${idProduct},'${idUser}',${count})`;
    return sql
}
export const cartUpdate = (idCart,count) => {
    const sql = `UPDATE carts SET countProduct = ${count} WHERE idCart = ${idCart}`
    return sql
}

export const cartDeleteOne = (idCart) => {
    const sql = `DELETE FROM carts WHERE idCart = ${idCart}`
    return sql;
}

export const cartDeleteList = (list) => {
    const sql = `DELETE FROM carts WHERE idCart IN (${list})`
    return sql;
}

export const cartDeleteAll = (idUser) => {
    const sql = `DELETE FROM carts WHERE idUser = ${idUser}`
    return sql;
}

/* sql statement for transports table */

export const transportInsert = (idTrans,idUser,data) => {
    const name = data.info.name;
    const phone = data.info.phone;
    const address = data.info.address;
    const costs = data.info.costs;
    const method = data.info.method;
    const sql = `INSERT INTO transports(idTrans,idUser,fullName,phone,address,costs,method)VALUES('${idTrans}','${idUser}','${name}','${phone}','${address}',${costs},'${method}')`;
    return sql;
}
export const transDetailInsert = (idTrans,idProduct,count) => {
    const sql = `INSERT INTO transDetail(idTrans,idProduct,countProduct,status)VALUES('${idTrans}',${idProduct},${count},'Chờ xác nhận')`
    return sql;
}
export const transDetailInsertInList = (idTrans,data) => {
    const list = data.list;
    const values = [];
    for(const item of list){
        const idProduct = item.idProduct;
        const countProduct = item.count;
        values.push(`(${idTrans},${idProduct},${countProduct},'Chờ xác nhận')`)
    }
    const sql = `INSERT INTO transports(idTrans,idProduct,countProduct,status) VALUES${values.join(', ')}`;
    return sql;
}
export const transportsSelectAll = () => {
    const sql = `SELECT t.*,CONCAT('[',GROUP_CONCAT(JSON_OBJECT('idProduct',d.idProduct,'count',d.countProduct,'status',d.status)),']') AS detail FROM transports t JOIN transDetail d ON t.idTrans = d.idTrans GROUP BY t.idTrans`;
    return sql;
}
export const transportsSelectOne = (idTrans) => {
    const sql = `SELECT t.*,CONCAT('[',GROUP_CONCAT(JSON_OBJECT('idProduct',d.idProduct,'name',p.nameProduct,'price',p.price,'count',d.countProduct,'status',d.status)),']') AS detail FROM transports t 
        LEFT JOIN transDetail d ON t.idTrans = d.idTrans
        LEFT JOIN products p ON d.idProduct = p.idProduct 
        WHERE t.idTrans = '${idTrans}' GROUP BY t.idTrans`;
    return sql;
}
export const transportsSelectList = (list) => {
    const sql = `SELECT t.*,CONCAT('[',GROUP_CONCAT(JSON_OBJECT('idProduct',d.idProduct,'count',d.countProduct,'status',d.status)),']') AS detail FROM transports t JOIN transDetail d ON t.idTrans = d.idTrans WHERE t.idTrans IN (${list}) GROUP BY t.idTrans`;
    return sql;
}
export const transportsUpdateStatusOne = (idTrans,status) => {
    const sql = `UPDATE transDetail SET status = '${status}' WHERE idTrans = ${idTrans}`;
    return sql;
}
export const transportsUpdateList = (status,list) => {
    const sql = `UPDATE transDetail SET status = '${status}' WHERE idTrans IN (${list})`;
    return sql;
}
export const transportsDeleteOne = (idTrans) => {
    const sql = `DELETE FROM transports WHERE idTrans = ${idTrans}`;
    return sql;
}
export const transportsDeleteList = (list) =>{
    const sql = `DELETE FROM transports WHERE idTrans IN (${list})`;
    return sql;
}