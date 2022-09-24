import { Application, Request, Response } from 'express';
import { OrderStore } from '../models/order';
import authenticate from './authenticate';
import { body, validationResult } from 'express-validator';
import { ProductStore } from '../models/product';

const getUserCurrentOrder = async (
  req: Request,
  resp: Response,
): Promise<void> => {
  try {
    const store = new OrderStore();
    const order = await store.getUserCurrentOrder(req.params.userId);
    if (order) resp.status(200).json(order);
    else resp.status(404).json({ message: 'No Active order for the user.' });
  } catch (err) {
    resp.status(500).json(err);
  }
};

const getUserCompletedOrders = async (
  req: Request,
  resp: Response,
): Promise<void> => {
  try {
    const store = new OrderStore();
    const orders = await store.getUserCompletedOrders(req.params.userId);
    resp.status(200).json(orders);
  } catch (err) {
    resp.status(500).json(err);
  }
};
const addProduct = async (req: Request, resp: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const productStore = new ProductStore();
      const orderStore = new OrderStore();
      const product = await productStore.show(<string>req.body.productId);
      if (!product) {
        try {
          resp
            .status(200)
            .json(
              await orderStore.addProduct(
                req.params.id,
                <string>req.body.productId,
                <number>req.body.quantity,
              ),
            );
        } catch (err) {
          resp.status(422).json({ message: `${err}` });
          return;
        }
      } else {
        resp
          .status(422)
          .json({ message: `Invalid Product Id ${req.body.productId}` });
      }
    } else {
      resp.status(422).json(errors);
    }
  } catch (err) {
    resp.status(500).json(err);
  }
};
const removeProduct = async (req: Request, resp: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const orderStore = new OrderStore();
      const line = await orderStore.removeProduct(<string>req.body.lineId);
      if (line !== null) {
        resp.status(200).json(line);
      } else {
        resp.status(400).json({ message: 'Invalid Line Id.' });
      }
    } else {
      resp.status(422).json(errors);
    }
  } catch (err) {
    resp.status(500).json(err);
  }
};
const index = async (req: Request, resp: Response): Promise<void> => {
  try {
    let pageSize: number | undefined;
    let pageNumber: number | undefined;
    if (req.query.pagesize) {
      if (isNaN(Number(req.query.pagesize))) {
        resp
          .status(400)
          .json({ message: 'Invalid Pagesize: ' + <string>req.query.pagesize });
        return;
      } else {
        pageSize = Number(req.query.pagesize);
      }
    }
    if (req.query.pagenumber) {
      if (isNaN(Number(req.query.pagenumber))) {
        resp.status(400).json({
          message: 'Invalid pagenumber: ' + <string>req.query.pagenumber,
        });
        return;
      } else {
        pageNumber = Number(req.query.pagenumber);
      }
    }
    const orderStore = new OrderStore();
    const orders = await orderStore.index(pageSize, pageNumber);
    resp.status(200).json(orders);
  } catch (err) {
    resp.status(500).json(err);
  }
};
const show = async (req: Request, resp: Response): Promise<void> => {
  try {
    const orderStore = new OrderStore();
    const order = await orderStore.show(req.params.id);
    if (order) {
      resp.status(200).json(order);
    } else {
      resp
        .status(404)
        .json({ messge: 'Order# ' + req.params.id + ' does not exist' });
    }
  } catch (err) {
    resp.status(500).json(err);
  }
};
const deleteOrder = async (req: Request, resp: Response): Promise<void> => {
  try {
    const orderStore = new OrderStore();
    const order = await orderStore.delete(req.params.id);
    if (order) {
      resp.status(200).json(order);
    } else {
      resp
        .status(404)
        .json({ message: 'Order#' + req.params.id + ' does not exist' });
    }
  } catch (err) {
    resp.status(500).json(err);
  }
};
const create = async (req: Request, resp: Response): Promise<void> => {
  try {
    const orderStore = new OrderStore();
    const order = await orderStore.create({
      id: -1,
      date: req.body.date,
      status: req.body.status,
      userId: req.body.userId,
      user: req.body.user,
      lines: req.body.lines,
    });
    resp.status(200).json(order);
  } catch (err) {
    resp.status(500).json(err);
  }
};
export const order_routes = (app: Application) => {
  app.get('/api/orders', authenticate, index);
  app.get('/api/orders/:id', authenticate, show);
  app.post(
    '/api/orders',
    authenticate,
    body('status', 'Order Status Should be active or complete').isIn([
      'active',
      'complete',
    ]),
    create,
  );
  app.delete('/api/orders/:id', authenticate, deleteOrder);
  app.get('/api/user_current_order/:userId', authenticate, getUserCurrentOrder);
  app.get(
    '/api/user_completed_orders/:userId',
    authenticate,
    getUserCompletedOrders,
  );
  app.post(
    '/api/orders/:id/products',
    body('quantity', 'quantity should be greater than zero.').isFloat({
      min: Number.MIN_VALUE,
    }),
    authenticate,
    addProduct,
  );
  app.delete('/api/orders/products/:lineId', authenticate, removeProduct);
};
