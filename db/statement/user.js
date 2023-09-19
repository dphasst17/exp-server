export const insertUserTypeU = (idUser) => {
    const sql = `INSERT INTO users (idUser,roleUser) VALUES('${idUser}',2)`;
    return sql;
}
export const insertUserTypeE = (idUser,name,email) => {
    const sql = `INSERT INTO users (idUser,nameUser,email,roleUser) VALUES('${idUser}','${name}','${email}',2)`;
    return sql;
}
export const login = (username) => {
    const sql = `SELECT * FROM login WHERE username = '${username}'`;
    return sql;
}
export const register = (idUser,username,password,type) => {
    const sql = `INSERT INTO login (idUser,username,password_hash,type_login)VALUES('${idUser}','${username}','${password}','${type}')`;
    return sql
}
export const getUser = (idUser) =>{
    const sql = `SELECT * FROM users WHERE idUser = '${idUser}'`;
    return sql;
}
export const getRole = (role) => {
    const sql = `SELECT u.* FROM users u JOIN login l ON u.idUser = l.idUser  WHERE l.role = ${role}`;
    return sql;
}
export const getRoleDifferent = (role) => {
    const sql = `SELECT u.* FROM users u JOIN login l ON u.idUser = l.idUser  WHERE l.role != ${role}`;
    return sql;
}
export const changeUser = (idUser,name,email,phone) => {
    const sql = `UPDATE users SET nameUser = ${name},email = ${email}, phone = '${phone}' WHERE idUser = '${idUser}'`;
    return sql;
}

export const changeRole = (idUser,role) => {
    const sql = `UPDATE login SET role = ${role} WHERE idUser = '${idUser}'`;
    return sql
}
export const changeRoleInList = (list,role) => {
    const sql = `UPDATE login SET role = ${role} WHERE idUser IN (${list})`;
    return sql
}

