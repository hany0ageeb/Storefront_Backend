# Build a Storefront Backend
------------------------------------------------------
# how to setup and connect to the database 
-> sudo postgres
-> psql
CREATE USER shopping WITH PASSWORD 'password123';
CREATE DATABASE shopping;
CREATE DATABASE shopping_test;
GRANT ALL PRIVILEGES ON DATABASE shopping to shopping_user;
GRANT ALL PRIVILEGES ON DATABASE shopping_test to shopping_user;
-------------------------------------------------------------------
-> db-migrate --env dev up
-------------------------------------------------------------------
Backend Port: 3000
Database Port: 5432
-------------------------------------------------------------------
installing packages -> npm install
-------------------------------------------------------------------
.env File content
-------------------------------------------------------------------
POSTGRES_HOST=127.0.0.1
POSTGRES_DB=shopping
POSTGRES_TEST_DB=shopping_test
POSTGRES_USER=shopping_user
POSTGRES_PASSWORD=password123
ENV=dev
SALT_ROUNDS=10
TOKEN_SECRET=YOU_SHOULDNT_PASS
DB_PORT=5432
SERVER_PORT=3000
-----------------------------------------------------------------