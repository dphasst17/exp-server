export const warehouseInsert = (idProduct,idUser,date,count,status) => {
    const sql = `INSERT INTO warehouse(idProduct,idpersonIOX,dateIOX,countProduct,statusWare) VALUES(${idProduct},'${idUser}','${date}',${count},'${status}')`
    return sql;
}
export const getWarehouseByStatus = (status) => {
    const sql = `SELECT * FROM warehouse WHERE statusWare = '${status}'`;
    return sql;
}
export const getTotalProduct = () => {
    const sql = `SELECT w.idProduct,p.nameProduct,p.imgProduct,p.price,
    SUM(CASE WHEN statusWare = 'import' THEN countProduct ELSE 0 END) - SUM(CASE WHEN statusWare = 'export' THEN countProduct ELSE 0 END) 
    AS totalProduct FROM warehouse w JOIN products p ON w.idProduct = p.idProduct GROUP BY w.idProduct;`
    return sql;
}
export const getAll = () => {
    const sql = `SELECT w.*,p.nameProduct FROM warehouse w JOIN products p ON w.idProduct = p.idProduct ORDER BY dateIOX DESC;`;
    return sql;
}
export const warehouseDeleteById = (idWarehouse) => {
    const sql = `DELETE FROM warehouse WHERE id=${idWarehouse}`;
    return sql;
}
export const warehouseUpdate = (idProduct,idUser,date,count,status) => {
    const sql = `UPDATE warehouse SET idProduct = ${idProduct},idpersonIOX = '${idUser}', dateIOX = '${date}',
    countProduct = ${count}, statusWare = '${status}'`;
    return sql;
}