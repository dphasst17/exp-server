export const insertUser = (idUser,name,email) => {
  const sql = `INSERT INTO users(idUser,nameUser,email)VALUES('${idUser}','${name}','${email}');`;
  return sql
}
export const Login = (props) => {
  const selectValue = props.type === "register" ? 'l.*,u.email FROM login l LEFT JOIN users u ON l.idUser = u.idUser' : '* FROM login'
  const whereValue = props.type === "register" ? `OR u.email = '${props.email}'` : (props.type === "admin" ? 'AND role != 2':'')
  const sql = `SELECT ${selectValue} WHERE username = '${props.username}' ${whereValue}`
  return sql
}
export const updateStatusLogin = (idUser,status) => {
  const sql = `UPDATE login SET status = '${status}' WHERE idUser = '${idUser}';`;
  return sql;
}
export const register = (idUser, username, password, type) => {
  const sql = `INSERT INTO login (idUser,username,password_hash,type_login,status)VALUES('${idUser}','${username}','${password}','${type}','activated');`;
  return sql;
};
export const getUser = (idUser) => {
  const sql = `SELECT u.*,l.role,
    (SELECT
      CONCAT('[', 
        GROUP_CONCAT(DISTINCT JSON_OBJECT('idCart',c.idCart,'idProduct', c.idProduct, 'nameProduct', p.nameProduct, 'price', p.price,'imgProduct',p.imgProduct,'count',c.countProduct,
        'discount',IF(sale.end_date >= CURDATE() AND sale.start_date <= CURDATE(), IFNULL(sd.discount, 0), 0))), 
      ']') AS detail
      FROM carts c 
      JOIN products p ON c.idProduct = p.idProduct
      LEFT JOIN saleDetail sd ON p.idProduct = sd.idProduct 
      LEFT JOIN sale ON sd.idSale = sale.idSale
      WHERE idUser = '${idUser}'
    )AS cart,
    CONCAT('[', GROUP_CONCAT(DISTINCT JSON_OBJECT('idBill',d.idBill,'idProduct', d.idProduct, 'nameProduct', pd.nameProduct, 'price', pd.price,'imgProduct',pd.imgProduct,'count',d.countProduct,'idType',pd.idType,'nameType',t.nameType,'discount',d.discount,'totalProduct',d.totalProduct)), ']') AS "order",
    CONCAT('[', GROUP_CONCAT(DISTINCT JSON_OBJECT('idAddress',a.idAddress,'typeAddress', a.typeAddress, 'detail', a.detail)), ']') AS address
    FROM users u 
    LEFT JOIN login l ON u.idUser = l.idUser
    LEFT JOIN carts c ON u.idUser = c.idUser 
    LEFT JOIN products pc ON c.idProduct = pc.idProduct
    LEFT JOIN bills b ON u.idUser = b.idUser
    LEFT JOIN billDetail d ON b.idBill = d.idBill
    LEFT JOIN products pd ON d.idProduct = pd.idProduct
    LEFT JOIN type t ON pd.idType = t.idType
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
export const checkMail = (email,idUser) => {
  const sql = `SELECT email from users WHERE email = '${email}' and idUser != '${idUser}';`;
  return sql;
}
export const checkPassword = (idUser) => {
  const sql = `SELECT password_hash FROM login WHERE idUser = '${idUser}';`;
  return sql;
}
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
export const updatePass = (newPass,idUser) => {
  const sql = `UPDATE login SET password_hash = '${newPass}' WHERE idUser = '${idUser}'`;
  return sql
}
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
export const deleteAddress = (listIdAddress) => {
  const sql = `DELETE FROM userAddress WHERE idAddress IN (${listIdAddress});`;
  return sql;
};

export const checkUsernameAndMail = (username,email) => {
  const sql = `SELECT u.idUser,l.username,u.email from users u LEFT JOIN login l ON u.idUser = l.idUser WHERE l.username = '${username}' and u.email = '${email}'`;
  return sql
}
