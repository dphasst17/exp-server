import * as colDetail from "../columnsDetail.js";
export const getAll = () => {
  const sql = `SELECT p.*,t.nameType,
    SUM(CASE WHEN w.statusWare = 'import' THEN countProduct ELSE 0 END) - SUM(CASE WHEN w.statusWare = 'export' THEN countProduct ELSE 0 END) 
    AS quantity,
    CONCAT_WS(',', CONCAT(UPPER('cpu'), ':', l.cpu), CONCAT(UPPER('capacity'), ':', r.capacity), CONCAT(UPPER('dpi'), ':', m.dpi), CONCAT(UPPER('resolution'), ':', mo.resolution), CONCAT(UPPER('connectionprotocol'), ':', h.connectionprotocol), CONCAT(UPPER('memory'), ':', v.memory), CONCAT(UPPER('layout'), ':', k.layout)) AS detail1,
    CONCAT_WS(',', CONCAT(UPPER('capacity'), ':', l.capacity), CONCAT(UPPER('busram'), ':', r.busram), CONCAT(UPPER('connection'), ':', m.connection), CONCAT(UPPER('sizeInch'), ':', mo.sizeInch), CONCAT(UPPER('capacitylevels'), ':', h.capacitylevels), CONCAT(UPPER('memoryspeed'), ':', v.memoryspeed), CONCAT(UPPER('connection'), ':', k.connection)) AS detail2,
    CONCAT_WS(',', CONCAT(UPPER('storage'), ':', l.storage), CONCAT(UPPER('typeram'), ':', r.typeram), CONCAT(UPPER('switch'), ':', m.switch), CONCAT(UPPER('scanfrequency'), ':', mo.scanfrequency), CONCAT(UPPER('size'), ':', h.size), CONCAT(UPPER('heartbeat'), ':', v.heartbeat), CONCAT(UPPER('switch'), ':', k.switch)) AS detail3,
    CONCAT_WS(',', CONCAT(UPPER('os'), ':', l.os), CONCAT(UPPER('ledlight'), ':', m.ledlight), CONCAT(UPPER('size'), ':', v.size), CONCAT(UPPER('keyboardmaterial'), ':', k.keyboardmaterial)) AS detail4
    FROM products p 
    LEFT JOIN warehouse w ON p.idProduct = w.idProduct
    LEFT JOIN ram r ON p.idProduct = r.idProduct 
    LEFT JOIN mouse m ON p.idProduct = m.idProduct 
    LEFT JOIN monitor mo ON p.idProduct = mo.idProduct 
    LEFT JOIN laptop l ON p.idProduct = l.idProduct 
    LEFT JOIN keyboard k ON p.idProduct = k.idProduct 
    LEFT JOIN harddrive h ON p.idProduct = h.idProduct 
    LEFT JOIN vga v ON p.idProduct = v.idProduct 
    LEFT JOIN type t ON p.idType = t.idType 
    GROUP BY p.idProduct
    ORDER BY p.idProduct;`;
  return sql;
};

export const getDetail = (idType, idProduct) => {
  let joinTable;
  let infoTable;
  let columnDetail;
  switch (idType) {
    case "1":
      joinTable = "laptop l ON p.idProduct = l.idProduct";
      columnDetail = colDetail.laptop.map((e) => `'${e}',l.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case "2":
      joinTable = "keyboard k ON p.idProduct = k.idProduct";
      columnDetail = colDetail.keyboard.map((e) => `'${e}',k.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case "3":
      joinTable = "monitor mo ON p.idProduct = mo.idProduct";
      columnDetail = colDetail.monitor.map((e) => `'${e}',mo.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case "4":
      joinTable = "ram r ON p.idProduct = r.idProduct";
      columnDetail = colDetail.ram.map((e) => `'${e}',r.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case "5":
      joinTable = "harddrive h ON p.idProduct = h.idProduct";
      columnDetail = colDetail.storage.map((e) => `'${e}',h.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case "6":
      joinTable = "vga v ON p.idProduct = v.idProduct";
      columnDetail = colDetail.vga.map((e) => `'${e}',v.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case "7":
      joinTable = "mouse m ON p.idProduct = m.idProduct";
      columnDetail = colDetail.mouse.map((e) => `'${e}',m.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
  }
  const sql = `SELECT p.*,t.nameType,
      SUM(CASE WHEN w.statusWare = 'import' THEN countProduct ELSE 0 END) - SUM(CASE WHEN w.statusWare = 'export' THEN countProduct ELSE 0 END) 
      AS quantity,
      CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT('type',i.type,'img',i.img)),']')AS img,
      ${infoTable}
      FROM products p 
      LEFT JOIN warehouse w ON p.idProduct = w.idProduct
      LEFT JOIN ${joinTable}
      LEFT JOIN type t ON p.idType = t.idType 
      LEFT JOIN imageProduct i ON p.idProduct = i.idProduct
      WHERE p.idProduct=${idProduct}
      GROUP BY p.idProduct;`;
  return sql;
};

export const getProductByType = (idType) => {
  let joinTable;
  let infoTable;
  let columnDetail;
  switch (idType) {
    case 1:
      joinTable = "laptop l ON p.idProduct = l.idProduct";
      columnDetail = colDetail.laptop.map((e) => `'${e}',l.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case 2:
      joinTable = "keyboard k ON p.idProduct = k.idProduct";
      columnDetail = colDetail.keyboard.map((e) => `'${e}',k.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case 3:
      joinTable = "monitor mo ON p.idProduct = mo.idProduct";
      columnDetail = colDetail.monitor.map((e) => `'${e}',mo.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case 4:
      joinTable = "ram r ON p.idProduct = r.idProduct";
      columnDetail = colDetail.ram.map((e) => `'${e}',r.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case 5:
      joinTable = "harddrive h ON p.idProduct = h.idProduct";
      columnDetail = colDetail.storage.map((e) => `'${e}',h.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case 6:
      joinTable = "vga v ON p.idProduct = v.idProduct";
      columnDetail = colDetail.vga.map((e) => `'${e}',v.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
    case 7:
      joinTable = "mouse m ON p.idProduct = m.idProduct";
      columnDetail = colDetail.mouse.map((e) => `'${e}',m.${e}`).join(", ");
      infoTable = `CONCAT('[',GROUP_CONCAT(DISTINCT JSON_OBJECT(${columnDetail})),']') AS detail`;
      break;
  }
  const sql = `SELECT p.*,t.nameType,
      SUM(CASE WHEN w.statusWare = 'import' THEN countProduct ELSE 0 END) - SUM(CASE WHEN w.statusWare = 'export' THEN countProduct ELSE 0 END) 
      AS quantity,
      ${infoTable}
      FROM products p 
      LEFT JOIN warehouse w ON p.idProduct = w.idProduct
      LEFT JOIN ${joinTable}
      LEFT JOIN type t ON p.idType = t.idType 
      WHERE p.idType=${idType}
      GROUP BY p.idProduct
      `;
  return sql;
};

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

export const searchProduct = (keyword) => {
  const sql = `SELECT products.*,lo.nameType,SUM(CASE WHEN w.statusWare = 'import' THEN countProduct ELSE 0 END) - SUM(CASE WHEN w.statusWare = 'export' THEN countProduct ELSE 0 END) 
      AS quantity,
      CONCAT_WS(',', CONCAT(UPPER('cpu'), ':', l.cpu), CONCAT(UPPER('capacity'), ':', r.capacity), CONCAT(UPPER('dpi'), ':', m.dpi), CONCAT(UPPER('resolution'), ':', mo.resolution), CONCAT(UPPER('connectionprotocol'), ':', h.connectionprotocol), CONCAT(UPPER('memory'), ':', v.memory), CONCAT(UPPER('layout'), ':', k.layout)) AS detail1,
      CONCAT_WS(',', CONCAT(UPPER('capacity'), ':', l.capacity), CONCAT(UPPER('busram'), ':', r.busram), CONCAT(UPPER('connection'), ':', m.connection), CONCAT(UPPER('sizeInch'), ':', mo.sizeInch), CONCAT(UPPER('capacitylevels'), ':', h.capacitylevels), CONCAT(UPPER('memoryspeed'), ':', v.memoryspeed), CONCAT(UPPER('connection'), ':', k.connection)) AS detail2,
      CONCAT_WS(',', CONCAT(UPPER('storage'), ':', l.storage), CONCAT(UPPER('typeram'), ':', r.typeram), CONCAT(UPPER('switch'), ':', m.switch), CONCAT(UPPER('scanfrequency'), ':', mo.scanfrequency), CONCAT(UPPER('size'), ':', h.size), CONCAT(UPPER('heartbeat'), ':', v.heartbeat), CONCAT(UPPER('switch'), ':', k.switch)) AS detail3,
      CONCAT_WS(',', CONCAT(UPPER('os'), ':', l.os), CONCAT(UPPER('ledlight'), ':', m.ledlight), CONCAT(UPPER('size'), ':', v.size), CONCAT(UPPER('keyboardmaterial'), ':', k.keyboardmaterial)) AS detail4
      FROM products
      LEFT JOIN warehouse w ON products.idProduct = w.idProduct
      LEFT JOIN laptop l ON products.idProduct = l.idProduct
      LEFT JOIN mouse m ON products.idProduct = m.idProduct
      LEFT JOIN monitor mo ON products.idProduct = mo.idProduct
      LEFT JOIN ram r ON products.idProduct = r.idProduct
      LEFT JOIN harddrive h ON products.idProduct = h.idProduct
      LEFT JOIN vga v ON products.idProduct = v.idProduct
      LEFT JOIN keyboard k ON products.idProduct = k.idProduct
      LEFT JOIN type ON products.idType = type.idType
      LEFT JOIN type lo ON products.idType=lo.idType 
      WHERE nameProduct LIKE '%${keyword}%' OR lo.nameType LIKE '%${keyword}%' OR brand LIKE '%${keyword}%'
      GROUP BY products.idProduct
      ORDER BY products.idProduct;`;
  return sql;
};
export const productInsertInfo = (listData) => {
  const sql = `INSERT INTO products(nameProduct,price,imgProduct,dateAdded,idType,brand)VALUES('${listData[0]}',${listData[1]},'${listData[2]}','${listData[3]}',${listData[4]},'${listData[5]}')`;
  return sql;
};
export const productInsertDetail = (idType, productValue) => {
  let newIdType = Number(idType);
  let table;
  switch (newIdType) {
    case 1:
      table = `laptop(idProduct,cpu,capacity,maxram,storage,os,resolution,sizeInch,battery,material)`;
      break;
    case 2:
      table = `keyboard(idProduct,layout,connection,switch,keyboardmaterial,material,weight)`;
      break;
    case 3:
      table = `monitor(idProduct,resolution,scanfrequency,brightness,contrast,viewing_angle,response_time,connector)`;
      break;
    case 4:
      table = `ram(idProduct,capacity,busram,typeram,speed,latency,voltage,color)`;
      break;
    case 5:
      table = `harddrive(idProduct,connectionprotocol,capacitylevels,size)`;
      break;
    case 6:
      table = `vga(idProduct,memory,memoryspeed,heartbeat,size,resolution,numberOfDisplayPort,numberOfHDMI,support)`;
      break;
    case 7:
      table = `mouse(idProduct,dpi,connection,switch,ledlight,type,number_of_button,size,weight)`;
      break;
  }
  const sql = `INSERT INTO ${table}VALUES(${productValue})`;
  return sql;
};

export const productUpdate = (idProduct, data) => {
  const sql = `UPDATE products SET nameProduct = ${data[0]},price = ${data[1]},imgProduct = '${data[2]}',
  dateAdded = '${data[3]}',idType = ${data[4]},brand = ${data[5]} WHERE idProduct = ${idProduct}`;
  return sql;
};
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

export const productAddImg = (idProduct,arrImg) => {
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
