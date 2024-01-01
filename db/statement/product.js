
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
/* SELECT TABLE_NAME,COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME IN ('laptop','keyboard','memory','monitor','storage','mouse','vga','phone') AND COLUMN_NAME NOT IN ('id', 'idProduct'); */
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
export const productUpdateDetail = (idType, idProduct, listData) => {
  let table;
  switch (idType) {
    case "1":
      table = `laptop SET cpu = '${listData[0]}',capacity = '${listData[1]}',maxram = '${listData[2]}',storage = '${listData[3]}',
      os = '${listData[4]}',resolution = '${listData[5]}',sizeInch = ${listData[6]},battery = '${listData[7]}',material = '${listData[8]}'`;
      break;
    case "2":
      table = `keyboard SET layout = ${listData[0]},connection = ${listData[1]},switch = ${listData[2]},
      keyboardmaterial = ${listData[3]},material = ${listData[4]},weight = ${listData[5]}`;
      break;
    case "3":
      table = `monitor SET resolution = ${listData[0]},scanfrequency = ${listData[1]},brightness = ${listData[2]},
      contrast = ${listData[3]},viewing_angle = ${listData[4]},response_time = ${listData[5]},connector = ${listData[6]}`;
      break;
    case "4":
      table = `ram SET capacity = ${listData[0]},busram = ${listData[1]},typeram = ${listData[2]},speed = ${listData[3]},
      latency = ${listData[4]},voltage = ${listData[5]},color = ${listData[6]}`;
      break;
    case "5":
      table = `harddrive SET connectionprotocol = ${listData[0]},capacitylevels = ${listData[1]},size = ${listData[2]}`;
      break;
    case "6":
      table = `vga SET memory = ${listData[0]},memoryspeed = ${listData[1]},heartbeat = ${listData[2]},size = ${listData[3]},
      resolution = ${listData[4]},numberOfDisplayPort = ${listData[5]},numberOfHDMI = ${listData[6]},support = ${listData[7]}`;
      break;
    case "7":
      table = `mouse SET dpi = ${listData[0]},connection = ${listData[1]},switch = ${listData[2]},ledlight = ${listData[3]},
      type = ${listData[4]},number_of_button = ${listData[5]},size = ${listData[6]},weight = ${listData[7]}`;
      break;
  }
  const sql = `UPDATE ${table} WHERE idProduct = ${idProduct}`;
  return sql;
};

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