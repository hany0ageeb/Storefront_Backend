import express from 'express';
import { order_routes } from './handlers/order';
import { product_routes } from './handlers/product';
import { user_routes } from './handlers/user';

const app: express.Application = express();
//const address = '0.0.0.0:3000';
app.use(express.json());
app.use(express.urlencoded());
product_routes(app);
user_routes(app);
order_routes(app);
app.listen(3000, function () {
  //console.log(`starting app on: ${address}`);
});
