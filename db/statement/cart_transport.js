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
export const checkCountProductInTrans = (idTrans) => {
    const sql = `SELECT COUNT(*)AS quantity FROM transDetail WHERE idTrans = '${idTrans}'`;
    return sql
}
export const transportInsert = (idTrans,idUser,data) => {
    const name = data.name;
    const phone = data.phone;
    const address = data.address;
    const costs = data.costs;
    const method = data.method;
    const sql = `INSERT INTO transports(idTrans,idUser,fullName,phone,address,costs,method)VALUES('${idTrans}','${idUser}','${name}','${phone}','${address}',${costs},'${method}')`;
    return sql;
}
export const transDetailInsert = (idTrans,idProduct,count) => {
    const sql = `INSERT INTO transDetail(idTrans,idProduct,countProduct,status)VALUES('${idTrans}',${idProduct},${count},'Chờ xác nhận')`
    return sql;
}
export const transDetailInsertInList = (listId,idTrans) => {
    const sql = `INSERT INTO transDetail(idTrans,idProduct,countProduct,discount,status)
    SELECT '${idTrans}'AS idTrans,p.idProduct,countProduct,IF(sale.end_date >= CURDATE() AND sale.start_date <= CURDATE(), IFNULL(sd.discount, 0), 0) AS discount,'Chờ xác nhận'AS status
    FROM carts c 
    LEFT JOIN products p ON p.idProduct = c.idProduct 
    LEFT JOIN saleDetail sd ON p.idProduct = sd.idProduct
    LEFT JOIN sale sale ON sale.idSale = sd.idSale
    WHERE c.idCart IN (${listId})`;
    return sql;
}
export const transportsSelectAll = () => {
    /* CONCAT('[',GROUP_CONCAT(JSON_OBJECT('idProduct',d.idProduct,'count',d.countProduct,'status',d.status)),']') AS detail */
    const sql = `SELECT t.* FROM transports t JOIN transDetail d ON t.idTrans = d.idTrans GROUP BY t.idTrans`;
    return sql;
}
export const transportsSelectOne = (idTrans) => {
    const sql = `SELECT t.*,
        CONCAT('[',GROUP_CONCAT(JSON_OBJECT('idTransDetail',d.idTransDetail,'idProduct',d.idProduct,'name',p.nameProduct,'price',p.price,'count',d.countProduct,'discount',d.discount,'status',d.status)),']') 
        AS detail 
        FROM transports t 
        LEFT JOIN transDetail d ON t.idTrans = d.idTrans
        LEFT JOIN products p ON d.idProduct = p.idProduct 
        WHERE t.idTrans = '${idTrans}' GROUP BY t.idTrans`;
    return sql;
}
export const transportsSelectByUser = (idUser) => {
    const sql = `SELECT t.*,(u.nameUser) AS shipper,CONCAT('[',GROUP_CONCAT(JSON_OBJECT('idTransDetail',d.idTransDetail,'idProduct',d.idProduct,'name',p.nameProduct,'price',p.price,'count',d.countProduct,'status',d.status)),']') AS detail 
        FROM transports t 
        LEFT JOIN transDetail d ON t.idTrans = d.idTrans
        LEFT JOIN products p ON d.idProduct = p.idProduct 
        LEFT JOIN users u ON t.idShipper = u.idUser
        WHERE t.idUser = '${idUser}' GROUP BY t.idTrans`;
    return sql;
}
export const transDetailUpdateStatus = (idTrans,status) => {
    const sql = `UPDATE transDetail SET status = '${status}' WHERE idTrans = '${idTrans}';`
    return sql;
}
export const transUpdateShipper = (idTrans,shipper) => {
    const sql = `UPDATE transports SET idShipper = '${shipper}' WHERE idTrans = '${idTrans}';`
    return sql;
}
export const transportsDelete = (idTrans) => {
    const sql = `DELETE FROM transports WHERE idTrans = '${idTrans}'`;
    return sql;
}
export const transDetailDeleteAll = (idTrans) => {
    const sql = `DELETE FROM transDetail WHERE idTrans = '${idTrans}';`
    return sql;
}
export const transDetailDeleteOne = (list) => {
    const sql = `DELETE FROM transDetail WHERE idTransDetail IN  (${list})`;
    return sql;
}
export const insertFailOrder = (idTrans) => {
    const sql = `INSERT INTO failorder(idFail,idUser,infoOrder)
    SELECT idTrans,idUser,CONCAT('name:',fullName,' - phone: ',phone,' - address: ',address)AS infoOrder 
    FROM transports 
    WHERE idTrans = '${idTrans}'`;
    return sql;
}
export const insertFailOrderDetail = (idTrans) => {
    const sql = `INSERT INTO failOrderDetail(idFail,idProduct,countProduct,discount)
    SELECT idTrans,idProduct,countProduct,discount FROM transDetail WHERE idTrans = '${idTrans}'`;
    return sql;
}