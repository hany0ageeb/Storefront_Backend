import { Application, Request, Response } from 'express';
import { UserStore } from '../models/user';
import jwt from 'jsonwebtoken';
import { configuration } from '../database';
import authenticate from './authenticate';
import { body } from 'express-validator/src/middlewares/validation-chain-builders';
import { validationResult } from 'express-validator/src/validation-result';
import { OrderStore } from '../models/order';

const index = async (_req: Request, resp: Response): Promise<void> => {
  try {
    const store = new UserStore();
    const users = await store.index();
    resp.status(200).json(users);
  } catch (err) {
    resp.status(500).json(err);
  }
};

const show = async (req: Request, resp: Response): Promise<void> => {
  try {
    const store = new UserStore();
    const user = await store.show(req.params.id);
    let limit = 5;
    if (user) {
      const orderStore = new OrderStore();
      if (req.query.limit) {
        if (isNaN(Number(req.query.limit))) {
          resp.status(400).json({ message: 'Invalid limit' });
          return;
        } else {
          limit = Number(req.query.limit);
        }
      }
      const recentOrders = await orderStore.getUserRecentOrders(
        user.id.toString(),
        limit,
      );
      resp.status(200).json({
        user: user,
        recentOrders: recentOrders,
      });
    } else {
      resp.status(404).json('Invalid User Id: ' + req.params.id);
    }
  } catch (err) {
    resp.status(500).json(err);
  }
};
const create = async (req: Request, resp: Response): Promise<void> => {
  try {
    const store = new UserStore();
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const newUser = await store.create({
        id: -1,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        password: req.body.password,
      });
      const token = jwt.sign(
        { user: newUser },
        <string>configuration.tokenSecret,
      );
      resp.status(200).json({ token: token, user: newUser });
    } else {
      resp.status(422).json(errors);
    }
  } catch (err) {
    if (err instanceof Error) resp.status(400).json({ message: err.message });
    else resp.status(500).json(err);
  }
};
const authenticateUser = async (
  req: Request,
  resp: Response,
): Promise<void> => {
  try {
    const store = new UserStore();
    const userName = req.body.userName;
    const password = req.body.password;
    const user = await store.authenticate(<string>userName, <string>password);
    if (user) {
      const token = jwt.sign({ user: user }, <string>configuration.tokenSecret);
      resp.status(200).json(token);
    } else {
      resp.status(401);
    }
  } catch (err) {
    resp.status(500).json(err);
  }
};
export const user_routes = (app: Application) => {
  void app.get('/api/users', authenticate, index);
  void app.get('/api/users/:id', authenticate, show);
  void app.post(
    '/api/users',
    body('userName', 'User Name Field is Required.').notEmpty(),
    body('firstName', 'firstName Field is required.').notEmpty(),
    body('lastName', 'lastName Field is Required.').notEmpty(),
    body('password', 'password Field is required'),
    create,
  );
  void app.post('/api/users/signin', authenticateUser);
  return;
};
