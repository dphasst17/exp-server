export const commentInsert = (idProduct,idUser,commentValue,date) => {
    const sql = `INSERT INTO comments(commentValue,idProduct,idUser,dateComment)VALUES('${commentValue}',${idProduct},'${idUser}','${date}')`;
    return sql;
}
export const commentGetAll = () => {
    const sql = `SELECT * FROM comments`;
    return sql
}
export const getCommentByIdProduct = (idProduct) => {
    const sql = `SELECT c.*,u.nameUser,u.img FROM comments c JOIN users u ON c.idUser = u.idUser WHERE idProduct = ${idProduct}`;
    return sql;
};
export const getCommentByIdUser = () => {
    const sql = `SELECT c.*,u.nameUser,u.img FROM comments c JOIN users u ON c.idUser = u.idUser WHERE idUser = '${idUser}'`;
    return sql;
}
export const commentDeleteByIdComment = (idComment) => {
    const sql =`DELETE FROM comments WHERE idComment = ${idComment}`;
    return sql;
}
export const commentDeleteByIdProduct = (idProduct) => {
    const sql =`DELETE FROM comments WHERE idProduct = ${idProduct}`;
    return sql;
}
export const commentDeleteByIdUser = (idUser) => {
    const sql =`DELETE FROM comments WHERE idUser = ${idProduct}`;
    return sql;
}
export const commentDeleteInList = (list) => {
    const sql =`DELETE FROM comments WHERE idComment IN (${list})`;
    return sql;
}