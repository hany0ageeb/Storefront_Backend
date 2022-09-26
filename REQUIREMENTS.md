# API Requirements
The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application. 

## API Endpoints
#### Products
- Index   
GET http://127.0.0.1:3000/api/products
- Show (args: product id) 
GET http://127.0.0.1:3000/api/products/:id
- Create (args: Product)[token required] 
POST http://127.0.0.1:3000/api/products
Notes: 
1. set Authorization header to Bearer {jwt token}
2. Request Body: 
    {
        "product": 
        {
            "id": -1, -- will be set by the api
            "name": "pro-name", -- not empty
            "price": "1", -- >= 0
            "category": "cat-name"
        }
    }
- [OPTIONAL] Top 5 most popular products 
GET http://127.0.0.1:3000/api/top_products?limit=5
Request Headers:
ACCEPT: application/json
- [OPTIONAL] Products by category (args: product category) 
GET http://127.0.0.1:3000/api/products/category/:categoryName
Request Headers:
ACCEPT: application/json
#### Users
- Index [token required]
GET http://127.0.0.1:3000/api/users
Request Headers:
    Authorization: Bearer //token//
- Show (args: id)[token required]
GET http://127.0.0.1:3000/api/users/:userId
Request Headers:
    Authorization: Bearer //token//
- Create (args: User)[token required]
POST http://127.0.0.1:3000/api/users
Request Headers:
Authorization: Bearer //token//
Content-Type: application/json
Request Body Data Shape:
{
    firstName: "required-field",
    lastName: "Required Field",
    userName: "Required Field and Unique",
    password: "Required Field"
}
#### Orders
- Current Order by user (args: user id)[token required]
GET http://127.0.0.1:3000/api/user_current_order/:userId
Request Headers:
Authorization: Bearer //token//
Accept: application/json
- [OPTIONAL] Completed Orders by user (args: user id)[token required]
GET http://127.0.0.1:3000/api/user_completed_orders/:userId
Request Headers:
Authorization: Bearer //token//
Accept: application/json
- [OPTIONAL] Index [token required]
GET http://127.0.0.1:3000/api/orders
Request Headers:
Authorization: Bearer //token//
- [OPTIONAL] Show [Token required]
GET http://127.0.0.1:3000/api/orders/:id
Request Headers:
Authorization: Bearer //token//
- [Optional] Create [token required]
POST http://127.0.0.1:3000/api/orders
Request Headers:
Authorization: Bearer //token//
Content-Type: application/json
Request Body Data Shape:
{
    "date": "20222-07-07", --this field is required
    "status": "active", --this field is required and should be active or complete
    "userId": 2, --this field is required and should be an id for existing user
    "lines": [ --can be empty array or omitted for empty orders !!!
        {
            "productId": 1,
            "quantity": 1
        }
    ]
}
## Data Shapes
#### Product
-  id
- name
- price
- [OPTIONAL] category

#### User
- id
- firstName
- lastName
- password

#### Orders
- id
- id of each product in the order
- quantity of each product in the order
- user_id
- status of order (active or complete)

### Order
- id: number
- date: Date
- status: string
- userId: number
### Order_Product
- id: number
- productId: number
- quantity: number
- orderId: number

#### Database Schema
/*****************Products*************/
CREATE TABLE products
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(18,4) NOT NULL CHECK (price >= 0),
    category VARCHAR(100)
);
/*******************************USERS********************/
CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    userName VARCHAR(100) NOT NULL UNIQUE,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    password VARCHAR(250) NOT NULL
);
/*******************Orders*****************************/
CREATE TABLE orders
(
    id SERIAL PRIMARY KEY,
    date Date NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active','complete')),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);
/***********************Order_Product*********************/
CREATE TABLE order_product
(
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(18,4) NOT NULL CHECK (quantity > 0)
);

