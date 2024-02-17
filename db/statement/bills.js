export const billsInsertOne = (idTrans,date) => {
  const sql = `INSERT INTO bills(idBill,idUser,idShipper,infoOrder,costs,dateBuy,total) 
    SELECT t.idTrans,idUser,t.idShipper,CONCAT('name:',fullName,' - phone: ',phone,' - address: ',address)AS infoOrder,t.costs,'${date}',
    SUM(d.countProduct * p.price * (1 - d.discount/100)) AS total 
    FROM transports t 
    LEFT JOIN transDetail d ON t.idTrans = d.idTrans 
    LEFT JOIN products p ON d.idProduct = p.idProduct
    WHERE t.idTrans = '${idTrans}';`;
  return sql;
};

export const billDetailInsert = (idTrans) => {
  const sql = `INSERT INTO billDetail(idBill,idProduct,countProduct,discount,totalProduct)
    SELECT d.idTrans,d.idProduct,d.countProduct,d.discount,(d.countProduct * p.price * (1 - d.discount/100)) AS total 
    FROM transDetail d JOIN products p ON d.idProduct = p.idProduct
    WHERE d.idTrans = '${idTrans}'`;
  return sql;
};
export const billDeleteOne = (idBill) => {
  const sql = `DELETE FROM bills WHERE idBill = ${idBill}`;
  return sql;
};
export const billDeleteList = (list) => {
  const sql = `DELETE FROM bills WHERE idBill IN (${list})`;
  return sql;
};
export const revenue = () => {
  const sql = `SELECT b.idProduct,SUM(countProduct) AS count, SUM(totalProduct) AS total FROM bills b JOIN products p ON b.idProduct = p.idProduct;`;
  return sql;
};
