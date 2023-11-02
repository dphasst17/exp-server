export const postsInsert = (date,type,idUser,value) => {
    const sql = `INSERT INTO posts(dateAdded,typePosts,poster,valuesPosts)VALUE('${date}','${type}','${idUser}','${value}')`;
    return sql;
}
export const postGetAll = () => {
    const sql = `SELECT * FROM posts ORDER BY dateAdded DESC`
    return sql;
}
export const postGetOne = (idPosts) => {
    const sql = `SELECT * FROM posts WHERE idPosts = ${idPosts}`
    return sql;
}
export const postsDeleteOne = (idPosts) => {
    const sql = `DELETE FROM posts WHERE idPosts = ${idPosts}`
    return sql;
}