/* sql statement for cart table */
export const getCartById = (idUser) => {
    const sql = `SELECT c.*,p.nameProduct,p.price,p.imgProduct FROM carts c JOIN products p ON c.idProduct = p.idProduct WHERE idUser = '${idUser}'`;
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

export const transportInsert = (idUser,idProduct,count,name,phone,address,costs,method) => {
    const sql = `INSERT INTO transports()VALUES('${idUser}',${idProduct},${count},'Chờ xác nhận','${name}','${phone}','${address}',${costs},'${method}')`;
    return sql;
}
export const transportInsertInList = (idUser,data) => {
    const list = data.list;
    const info = data.info;
    const values = [];
    for (const item of list) {
        // Lấy ra idProduct và countProduct từ item
        const idProduct = item.idProduct;
        const countProduct = item.count;
        // Lấy ra các giá trị cần thiết từ phần info
        const nameUser = info.name;
        const phone = info.phone;
        const address = info.address;
        const cost = info.costs;
        const method = info.method;
        // Thêm tập giá trị vào mảng values
        values.push(`(${idProduct},'${idUser}', ${countProduct},'Chờ xác nhận', '${nameUser}', '${phone}', '${address}', ${cost}, '${method}')`);
    }
    const sql = `INSERT INTO transports(idProduct,idUser,countProduct,status,fullName,phone,address,costs,method)VALUES${values.join(', ')}`
    return sql;
}
export const transportsSelectAll = () => {
    const sql = `SELECT * FROM transports`;
    return sql;
}
export const transportsSelectOne = (idTrans) => {
    const sql = `SELECT * FROM transports WHERE idTrans = ${idTrans}`;
    return sql;
}
export const transportsSelectList = (list) => {
    const sql = `SELECT * FROM transports WHERE idTrans IN (${list})`;
    return sql;
}
export const transportsUpdateStatusOne = (idTrans,status) => {
    const sql = `UPDATE transports SET status = '${status}' WHERE idTrans = ${idTrans}`;
    return sql;
}
export const transportsUpdateList = (status,list) => {
    const sql = `UPDATE transports SET status = '${status}' WHERE idTrans IN (${list})`;
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