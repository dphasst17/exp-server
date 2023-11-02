export const bestselling = () => {
    const sql = `SELECT h.idProduct,p.nameProduct,p.price,p.imgProduct,p.idType,t.nameType,p.brand,SUM(countProduct)AS sold 
    FROM billDetail h 
    JOIN products p ON h.idProduct = p.idProduct 
    JOIN type t ON t.idType = p.idType 
    GROUP BY idProduct ORDER BY SUM(countProduct) DESC LIMIT 0,7;`;
    return sql;
}
export const topView = () => {
    const sql = `SELECT p.*,t.nameType FROM products p JOIN type t ON p.idType = t.idType ORDER BY view DESC LIMIT 0,7;`;
    return sql;
}
export const revenue_by_type = () => {
    const sql = `SELECT p.idType,t.nameType,COUNT(p.idType) AS count,MIN(p.price)AS min,
    ((MIN(p.price)+ MAX(p.price))/2) AS medium, MAX(price)AS max,
    SUM(p.view)AS totalView,
    SUM(b.countProduct)AS soldProduct,
    (SELECT SUM(countProduct) FROM billDetail) AS soldAllProduct,
    SUM(b.totalProduct)AS totalPrice, 
    (SUM(b.countProduct) / (SELECT SUM(countProduct) FROM billDetail)) AS percentSold,
    (SUM(b.totalProduct) / (SELECT SUM(total) FROM bills)) AS percentRevenue
    FROM products p 
    LEFT JOIN billDetail b ON p.idProduct = b.idProduct 
    LEFT JOIN type t ON p.idType = t.idType 
    GROUP BY p.idType;`;
    return sql;
}
export const total_revenue = () => {
    const sql = `SELECT SUM(countProduct)AS sold,SUM(totalProduct)AS revenue FROM billDetail;`;
    return sql;
}
export const month_revenue = () => {
    const sql =`SELECT SUM(total)AS revenue, DATE_FORMAT(dateBuy, '%Y-%m') AS month FROM bills GROUP BY month ORDER BY month ASC;`;
    return sql;
}
