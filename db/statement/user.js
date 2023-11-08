export const insertUserTypeU = (idUser) => {
  const sql = `INSERT INTO users (idUser,roleUser) VALUES('${idUser}',2);`;
  return sql;
};
export const insertUserTypeE = (idUser, name, email) => {
  const sql = `INSERT INTO users (idUser,nameUser,email,roleUser) VALUES('${idUser}','${name}','${email}',2);`;
  return sql;
};
export const login = (username) => {
  const sql = `SELECT * FROM login WHERE username = '${username}';`;
  return sql;
};
export const adminLogin = (username) => {
  const sql = `SELECT * FROM login WHERE username = '${username}' AND role != 2`
  return sql;
}
export const updateStatusLogin = (idUser,status) => {
  const sql = `UPDATE login SET status = '${status}' WHERE idUser = '${idUser}';`;
  return sql;
}
export const register = (idUser, username, password, type) => {
  const sql = `INSERT INTO login (idUser,username,password_hash,type_login)VALUES('${idUser}','${username}','${password}','${type}');`;
  return sql;
};
export const getUser = (idUser) => {
  const sql = `SELECT u.*,l.role,
    CONCAT('[', GROUP_CONCAT(DISTINCT JSON_OBJECT('idCart',c.idCart,'idProduct', c.idProduct, 'nameProduct', pc.nameProduct, 'price', pc.price,'imgProduct',pc.imgProduct,'count',c.countProduct)), ']') AS cart,
    CONCAT('[', GROUP_CONCAT(DISTINCT JSON_OBJECT('idBill',d.idBill,'idProduct', d.idProduct, 'nameProduct', pd.nameProduct, 'price', pd.price,'imgProduct',pd.imgProduct,'count',d.countProduct,'discount',d.discount,'totalProduct',d.totalProduct)), ']') AS "order",
    CONCAT('[', GROUP_CONCAT(DISTINCT JSON_OBJECT('idAddress',a.idAddress,'typeAddress', a.typeAddress, 'detail', a.detail)), ']') AS address
    FROM users u 
    LEFT JOIN login l ON u.idUser = l.idUser
    LEFT JOIN carts c ON u.idUser = c.idUser 
    LEFT JOIN products pc ON c.idProduct = pc.idProduct
    LEFT JOIN bills b ON u.idUser = b.idUser
    LEFT JOIN billDetail d ON b.idBill = d.idBill
    LEFT JOIN products pd ON d.idProduct = pd.idProduct
    LEFT JOIN userAddress a ON u.idUser = a.idUser
    WHERE u.idUser = '${idUser}'
    ORDER BY a.idAddress DESC;
`;
  return sql;
};
export const getRole = (role) => {
  const sql = `SELECT u.*,l.role FROM users u JOIN login l ON u.idUser = l.idUser  WHERE l.role = ${role};`;
  return sql;
};
export const getAllUser = () => {
  const sql = `SELECT u.*,l.role FROM users u JOIN login l ON u.idUser = l.idUser ORDER BY l.role ASC;`;
  return sql;
};
export const changeUser = (idUser, name, email, phone) => {
  const sql = `UPDATE users SET nameUser = '${name}',email = '${email}', phone = '${phone}' WHERE idUser = '${idUser}';`;
  return sql;
};

export const changeRole = (idUser, role) => {
  const sql = `UPDATE login SET role = ${role} WHERE idUser = '${idUser}';`;
  return sql;
};
export const changeRoleInList = (list, role) => {
  const sql = `UPDATE login SET role = ${role} WHERE idUser IN (${list});`;
  return sql;
};
export const addressGetAll = () => {
  const sql = `SELECT * FROM userAddress;`
  return sql;
}
export const addressSelectAll = (idUser) => {
  const sql = `SELECT * FROM userAddress WHERE idUser = '${idUser}';`;
  return sql;
};
export const addAddress = (idUser, type, detail) => {
  const sql = `INSERT INTO userAddress(idUser,typeAddress,detail)VALUE('${idUser}','${type}','${detail}');`;
  return sql;
};
export const updateAddress = (idAddress, detail) => {
  const sql = `UPDATE userAddress SET detail = '${detail}' WHERE idAddress = ${idAddress};`;
  return sql;
};
export const updateTypeAddress = (idAddress, type) => {
  const sql = `UPDATE userAddress SET typeAddress = '${type}' WHERE idAddress = ${idAddress};`;
  return sql;
};
export const addressRemoveDefault = (idUser) => {
  const sql = `UPDATE userAddress SET typeAddress = 'extra' WHERE idUser = '${idUser}' AND typeAddress = 'default';`;
  return sql;
}
export const deleteAddress = (idAddress) => {
  const sql = `DELETE FROM userAddress WHERE idAddress = ${idAddress};`;
  return sql;
};
