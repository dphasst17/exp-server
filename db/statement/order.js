export const getAllOrderSuccess = () => {
    const sql = `SELECT idBill,idUser,idShipper,infoOrder,costs,dateBuy,total FROM bills`;
    return sql
}
export const getAllOrderFalse = () => {
    const sql = `SELECT idFail,idUser,infoOrder,note FROM failorder`;
    return sql
}

export const getOrderDetail = (typeOrder,id) => {
    const colSelect = typeOrder === 'success' ? 'b.idBill,b.idUser,b.idShipper,b.infoOrder,b.costs,b.dateBuy,b.total' : 'f.idFail,f.idUser,f.infoOrder,f.note'
    const fromTable = typeOrder === 'success' ? 'bills' : 'failorder'
    const joinDetail = typeOrder === 'success' ? 'billDetail' : 'failOrderDetail'
    const characters = typeOrder === 'success' ? 'b' : 'f'
    const charactersDetail = typeOrder === 'success' ? 'bd' : 'fd'
    const idCol = typeOrder === 'success' ? 'idBill' : 'idFail'
    const colDetail = typeOrder === 'success' ? '' :''
    const sql = `SELECT ${colSelect},
    CONCAT('[',GROUP_CONCAT(JSON_OBJECT('idProduct',${charactersDetail}.idProduct,'nameProduct',p.nameProduct,'imgProduct',p.imgProduct,'countProduct',${charactersDetail}.countProduct,'price',p.price,'discount',${charactersDetail}.discount)),']') AS detail
    FROM ${fromTable} ${characters} 
    LEFT JOIN ${joinDetail} ${charactersDetail} ON ${characters}.${idCol} = ${charactersDetail}.${idCol}
    LEFT JOIN products p ON ${charactersDetail}.idProduct = p.idProduct
    WHERE ${characters}.${idCol} = '${id}'`
    return sql
}