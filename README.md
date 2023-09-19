# Express server
This is a simple server using Express js and MySQL

## Install
```
npm install
```

## Run server

```
nodemon index.js
```
The server will run on port 1705. You can access the server at http://localhost:1705.

## Endpoint list
### User 
- The endpoint for the user is started with : `/user`
    * Get all user: `/`
        * Demo: 
        ```
        fetch('http://localhost:1705/api/user/',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization': 'Bearer token'
            }
        })
        .then(res => {return res.json()})
        .then(data => console.log(data))
        ```
    * Get user by role: `/role/:role`
    * Get user has a role different from the role on the path: `/role/diff/:role`
    * Change information of user: `api/user/change/info`
        * Demo
        ```
        fetch('http://localhost:1705/api/user/change/info',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization': 'Bearer token'
            },
            body:JSON.stringify({name:'newName',phone:'012345678',email:'email@gmail.com'})
        })
        .then(res => {return res.json()})
        .then(data => console.log(data))
        ```
    * Change role user: `/change/role/:newRole`
        * This is the part to change user rights in the admin page
         - Classify roles in the web:
            + 0 is ADMIN
            + 1 is staff
            + 2 is user
        * Changing roles can only be done by accounts with role 0
        * Demo
        ```
        fetch('http://localhost:1705/api/user/change/role/1',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization': 'Bearer token'
            },
            body:JSON.stringify({idUser:'idUser1'})
        })
        .then(res => {return res.json()})
        .then(data => console.log(data))
        ```
        This section changes the user role from 2 to 1

    * Change role by list : `/change/list/role/newRole`
        * Demo
        ```
        fetch('http://localhost:1705/api/user/change/role/1',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization': 'Bearer token'
            },
            body:JSON.stringify({list:['idUser1','idUser2','idUser3',]})
        })
        .then(res => {return res.json()})
        .then(data => console.log(data))
        ```
### Product
- The endpoint for product is started with: `/api/product`
    * Get all product: `/`
    * Get new product: `/new`
    * Get product by name type: `/type/:nameType`
    * Get detail product: `/detail/:idType/:idProduct`
    * Add new product: `/insert`
        ![Table product](imgReadme/productTable.png)
            * The information that needs to be posted to the products table:
                - Name product
                - Price
                - Image
                - Date Added
                - Id type
                - Brand
        ![Table detail product](imgReadme/detailProduct.png)
        * Demo:
        ```
        fetch('http://localhost:1705/api/product/insert',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({folder:'product',product:[],detail:[]})
        })
        ```
    * Update product: `/update/:idProduct` (Update basic product information || Cập nhật thông tin cơ bản của sản phẩm.)
    * Update product detail: `/detail/update/:idType/:idProduct` (Update detailed product information|| Cập nhật thông tin chi tiết của sản phẩm)
        The data update part of product details you need to enter in order from top to bottom according to the corresponding table as shown in the image above.
        * Demo:
        Update data for a product whose type is 1 corresponding to the laptop table
        ```
        fetch('http://localhost:1705/api/product/detail/update/1/21',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(['AMD Ryzen 5','16GB',64,'512GB','Windows 11 Home','1920x1080',15.6,'53Wh','Vỏ nhựa'])
        })
        ```
    * Delete product: `/delete/:idProduct`
    * Delete product in list: `/list/delete`
        * Demo:
        ```
        fetch('http://localhost:1705/api/product/list/delete',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify([1,4,12,6])
        })
        ```
### Cart
- The endpoint for cart is started with: `/api/cart`
    * Get cart by id user: `/`
    * Add product to cart of user: `/add`
    * Get list product in cart: `/list`
    * Change count product in cart: `/change`
    * Delete all product in cart of user: `/delete`
    * Delete product in cart: `/delete/:idCart`
    * Delete list product in cart: `/list/delete`
### Transports
- The endpoint for transports is started with: `/api/transports`
    * Get all transports: `/`
    * Get transports by id: `/get/:idTrans`
    * Get transports in list: `/list/get`
    * Insert one: `/insert`
    * Insert multiple: `/list/insert`
    * Update status for one order: `/update/:idTrans`
    * Update status for multiple order: `/list/update/:status`
        * Status 1 is : 'Chờ xác nhận'
        * Status 2 is : 'Đang chuẩn bị đơn hàng'
        * Status 3 is : 'Đang vận chuyển'
    If the order is successfully shipped, data will be transferred from the transport table to the bills table
    * Insert data to bills table: `/success`
        * Demo
        ```
        fetch('http://localhost:1705/api/product/list/delete',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({id:'2',date:'2023-09-05'})
        })
        ```
    * If you want to add multiple orders to the bills table or successfully deliver multiple orders at the same time,
        there is the following endpoint:`/list/success`
        * Demo
        ```
        fetch('http://localhost:1705/api/product/list/delete',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({list:[1,4,16,20],date:'2023-09-05'})
        })
        ```


### Comment
- The endpoint for comment is started with: `/api/comment`
### Warehouse
- The endpoint for warehouse is started with: `/api/ware`
### Auth
- The endpoint for auth is started with: `/auth`

- There is also an endpoint used to restart the server: `/restart`
  And endpoint for save image : `/upload/:folder`