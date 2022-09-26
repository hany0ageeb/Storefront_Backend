import express from 'express';
import { order_routes } from './handlers/order';
import { product_routes } from './handlers/product';
import { user_routes } from './handlers/user';
import { configuration } from './database';

const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded());
product_routes(app);
user_routes(app);
order_routes(app);
app.listen(configuration.serverPort, function () {});
