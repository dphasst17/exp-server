
export const getColDemo = () => {
  const sql = `SELECT type, CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT('name',name)),']') AS detail FROM typedetail WHERE displayorder < 5 GROUP BY type ORDER BY type, displayorder;`;
  return sql;
}
export const getAllProduct = (parseData) => {
  const arrDetail = [1,2,3,4]
  const handleConcat = (index) => {
    const concatData = parseData.flatMap((e) =>
      e.detail
        .filter((d, i) => i === index)
        .map(
          (c) => `CONCAT(UPPER('${c.name}'), ':', ${e.type === 'mouse' ? `${e.shortName}u` : e.shortName}.${c.name})`
        )
    );
    return concatData;
  };
  const detailResult = arrDetail.map((e,i) => `CONCAT_WS(',', ${handleConcat(i)}) AS detail${e}`)
  const sql = `SELECT p.*,t.nameType,SUM(CASE WHEN w.statusWare = 'import' THEN countProduct ELSE 0 END) - SUM(CASE WHEN w.statusWare = 'export' THEN countProduct ELSE 0 END) AS quantity,${detailResult.map(e => e)} FROM products p LEFT JOIN warehouse w ON p.idProduct = w.idProduct LEFT JOIN type t ON p.idType = t.idType ${parseData.map(
    (e) => `LEFT JOIN ${e.type} ${e.type === 'mouse' ? `${e.shortName}u` : e.shortName} ON p.idProduct = ${e.type === 'mouse' ? `${e.shortName}u` : e.shortName}.idProduct`
  ).join(' ')} GROUP BY p.idProduct ORDER BY p.idProduct;`;
  return sql
}

export const getProductDetail = (results,name,shortName,idProduct) => {
  const colDetail = results.map((e) => e.COLUMN_NAME);
    const colQuery = colDetail.map(
      (e) => `'${e}',${shortName}.${e}`
    )
    const sql = `SELECT p.*,t.nameType,SUM(CASE WHEN w.statusWare = 'import' THEN countProduct ELSE 0 END) - SUM(CASE WHEN w.statusWare = 'export' THEN countProduct ELSE 0 END) AS quantity,
    CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${colQuery})),']') AS detail ,
    CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT('type',i.type,'img',i.img)),']')AS img
    FROM products p 
    LEFT JOIN warehouse w ON p.idProduct = w.idProduct
    LEFT JOIN type t ON p.idType = t.idType 
    LEFT JOIN ${name} ${shortName} ON p.idProduct = ${shortName}.idProduct
    LEFT JOIN imageProduct i ON p.idProduct = i.idProduct
    WHERE p.idProduct=${idProduct}
    GROUP BY p.idProduct;`;
    return sql
}
export const getColDetail = (name) => {
  const sql = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${name}' AND COLUMN_NAME NOT IN ('id', 'idProduct');`;
  return sql;
}
export const getProductDetailByType = (results,name,shortName) => {
  const colDetail = results.map((e) => e.COLUMN_NAME);
    const colQuery = colDetail.map(
      (e) => `'${e}',${shortName}.${e}`
    )
    const sql = `SELECT product.*,t.nameType,SUM(CASE WHEN w.statusWare = 'import' THEN countProduct ELSE 0 END) - SUM(CASE WHEN w.statusWare = 'export' THEN countProduct ELSE 0 END) AS quantity,
    CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${colQuery})),']') AS detail 
    FROM products product 
    LEFT JOIN warehouse w ON product.idProduct = w.idProduct
    LEFT JOIN type t ON product.idType = t.idType 
    LEFT JOIN ${name} ${shortName} ON product.idProduct = ${shortName}.idProduct
    WHERE t.nameType = '${name}'
    GROUP BY product.idProduct;`;
    return sql
}
/* New feature */
export const changeTable = (table,method,column,datatypes) => {
  const sql = `ALTER TABLE ${table} ${method} COLUMN ${column} ${method === 'add' ? datatypes : ''};`
  return sql;
}
export const updateDiscount = (discount,listIdProduct) => {
  const sql = `UPDATE products SET discount = ${discount} WHERE idProduct IN (${listIdProduct.map(e => e)});`;
  return sql
}
/* --- */
export const getNewProduct = () => {
  const sql = `SELECT p.* ,t.nameType,SUM(CASE WHEN w.statusWare = 'import' THEN countProduct ELSE 0 END) - SUM(CASE WHEN w.statusWare = 'export' THEN countProduct ELSE 0 END) 
  AS quantity
  FROM products p 
  LEFT JOIN warehouse w ON p.idProduct = w.idProduct
  LEFT JOIN type t ON p.idType = t.idType
  GROUP BY p.idProduct 
  ORDER BY dateAdded DESC, p.idProduct DESC LIMIT 0,10`;
  return sql;
};
export const search = (parseData,keyword) => {
  const arrDetail = [1,2,3,4]
  const handleConcat = (index) => {
    const concatData = parseData.flatMap((e) =>
      e.detail
        .filter((d, i) => i === index)
        .map(
          (c) => `CONCAT(UPPER('${c.name}'), ':', ${e.type === 'mouse' ? `${e.shortName}u` : e.shortName}.${c.name})`
        )
    );
    return concatData;
  };
  const detailResult = arrDetail.map((e,i) => `CONCAT_WS(',', ${handleConcat(i)}) AS detail${e}`)
  const sql = `SELECT p.*,t.nameType,SUM(CASE WHEN w.statusWare = 'import' THEN countProduct ELSE 0 END) - SUM(CASE WHEN w.statusWare = 'export' THEN countProduct ELSE 0 END) AS quantity,${detailResult.map(e => e)} FROM products p LEFT JOIN warehouse w ON p.idProduct = w.idProduct LEFT JOIN type t ON p.idType = t.idType ${parseData.map(
    (e) => `LEFT JOIN ${e.type} ${e.type === 'mouse' ? `${e.shortName}u` : e.shortName} ON p.idProduct = ${e.type === 'mouse' ? `${e.shortName}u` : e.shortName}.idProduct`
  ).join(' ')} WHERE nameProduct LIKE '%${keyword}%' OR t.nameType LIKE '%${keyword}%' OR brand LIKE '%${keyword}%' GROUP BY p.idProduct ORDER BY p.idProduct;`;
  return sql
}

export const getCol = (nameType) => {
  const sql = `SELECT name,datatypes FROM typedetail WHERE type = '${nameType}';`;
  return sql;
}

export const productInsertInfo = (listData) => {
  const sql = `INSERT INTO products(nameProduct,price,imgProduct,dateAdded,idType,brand)
  SELECT '${listData[0]}',${listData[1]},'${listData[2]}','${listData[3]}',idType,'${listData[5]}'
  FROM type
  WHERE nameType = '${listData[4]}';
  `
  return sql;
};
export const insertProductDetail = (table,idProduct,results,data) => {
  const lastResult = results.map(e => `${e.name}`)
  const values = results.map(e => e.datatypes === 'text' ?  `'${data[e.name]}'` : data[e.name])
  const sql = `INSERT INTO ${table}(idProduct,${lastResult})VALUES(${idProduct},${values})`;
  return sql
}

export const productUpdate = (idProduct, data) => {
  const sql = `UPDATE products SET nameProduct = ${data[0]},price = ${data[1]},imgProduct = '${data[2]}',
  dateAdded = '${data[3]}',idType = ${data[4]},brand = ${data[5]} WHERE idProduct = ${idProduct}`;
  return sql;
};
/* change it */
export const updateDetail = (arrCol,idProduct,data,nameType) => {
  const valueUpdate = arrCol.map(e => `${e.name} = ${e.datatypes === 'text' ? `'${data[e.name]}'` : data[e.name]}`)
  const sql = `UPDATE ${nameType} SET ${valueUpdate} WHERE idProduct = ${idProduct};`;
  return sql;
}

export const productAddImg = (idProduct, arrImg) => {
  const resultArr = arrImg.map(e => `(${idProduct},'extra','${e}')`)
  const sql = `INSERT INTO imageProduct(idProduct,type,img)VALUES${resultArr}`
  return sql;
}

export const productDelete = (idProduct) => {
  const sql = `DELETE FROM products WHERE idProduct = ${idProduct}`;
  return sql;
};

export const productDeleteList = (list) => {
  const sql = `DELETE FROM products WHERE idProduct IN (${list})`;
  return sql;
};

export const insertType = (name) => {
  const sql = `INSERT INTO type(nameType)VALUES('${name}');`
  return sql;
}
export const createNewTypeTB = (tbName, arrCol) => {
  const sql = `CREATE TABLE ${tbName}(
    id INT AUTO_INCREMENT PRIMARY KEY,
    idProduct INT NOT NULL,
    ${arrCol?.map(e => `${e.nameCol} ${e.type.toUpperCase()} ${e.limit !== 0 ? `(${e.limit})`: ''}`)},
    FOREIGN KEY (idProduct) REFERENCES products(idProduct)
  );`
  return sql;
}
export const addInfoTable = (tbName,arrCol) => {
  const arrResult = arrCol.map(e => `('${tbName}${e.nameCol}','${tbName}','${e.nameCol}','${e.type !== 'number' ? 'text' : 'number'}','${e.displayname}',${e.order})`)
  const sql = `INSERT INTO typedetail(id,type,name,datatypes,displayname,displayorder)VALUES ${arrResult};`;
  return sql
}

export const getInfoType = () => {
  const sql = `SELECT type,CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT('id',id,'name',name,'datatypes',datatypes,'displayname',displayname,'displayorder',displayorder) ORDER BY displayorder ASC),']') AS detail FROM typedetail GROUP BY type ;`;
  return sql;
}