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
    date date NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(10) NOT NULL DEFAULT 'active' /*CHECK (status IN ('active','complete')),*/,
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


