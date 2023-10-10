export const bestselling = () => {
    const sql = `SELECT h.idProduct,p.nameProduct,p.price,p.imgProduct,p.idType,t.nameType,p.brand,SUM(countProduct)AS sold 
    FROM billDetail h 
    JOIN products p ON h.idProduct = p.idProduct 
    JOIN type t ON t.idType = p.idType 
    GROUP BY idProduct ORDER BY SUM(countProduct) DESC LIMIT 0,5;`;
    return sql;
}
export const topView = () => {
    const sql = `SELECT * FROM products ORDER BY view DESC LIMIT 0,5;`;
    return sql;
}
export const revenue_by_type = () => {
    const sql = `SELECT p.idType,t.nameType, SUM(b.countProduct)AS totalCount,SUM(b.totalProduct)AS totalPrice 
    FROM billDetail b 
    LEFT JOIN products p ON b.idProduct = p.idProduct 
    LEFT JOIN type t ON p.idType = t.idType 
    GROUP BY p.idType;`;
    return sql;
}
export const total_revenue = () => {
    const sql = `SELECT SUM(countProduct)AS sold,SUM(totalProduct)AS revenue FROM billDetail;`;
    return sql;
}
