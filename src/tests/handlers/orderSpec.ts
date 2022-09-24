import express, { Application } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { configuration } from '../../database';
import { order_routes } from '../../handlers/order';
import { Order, OrderStore } from '../../models/order';
import { User, UserStore } from '../../models/user';

const app: Application = express();
configuration.environment = 'test';
order_routes(app);
let order: Order;
describe('GET api/orders', () => {
  it('Should Return 200', async () => {
    const token = jwt.sign({ userId: -1 }, <string>configuration.tokenSecret);
    await request(app)
      .get('/api/orders')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
  it('should respond with json', async () => {
    const token = jwt.sign({ userId: -1 }, <string>configuration.tokenSecret);
    await request(app)
      .get('/api/orders')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', 'application/json; charset=utf-8');
  });
  it('should return 403', async () => {
    await request(app)
      .get('/api/orders')
      .set('Accept', 'application/json')
      .expect(403);
  });
});
describe('GET api/orders/:id', () => {
  const orderStore = new OrderStore();
  const userStore = new UserStore();
  let user: User;
  beforeAll(async () => {
    user = await userStore.create({
      id: -1,
      firstName: 'hany',
      lastName: 'ageeb',
      password: 'pass',
      userName: 'pla',
    });
    order = await orderStore.create({
      id: -1,
      date: new Date(),
      status: 'active',
      userId: user.id,
      lines: undefined,
      user: undefined,
    });
  });
  it('Should Return 200', async () => {
    const token = jwt.sign(user, <string>configuration.tokenSecret);
    await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
  it('should return 404', async () => {
    const token = jwt.sign(user, <string>configuration.tokenSecret);
    await request(app)
      .get(`/api/orders/-1`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
  it('Should return 403', async () => {
    await request(app).get(`/api/orders/-1`).expect(403);
  });
  afterAll(async () => {
    await orderStore.delete(order.id.toString());
    await userStore.delete(user.id.toString());
  });
});
describe('GET api/user_current_order/:user_id', () => {
  let user: User;
  let activeOrder: Order;
  //let completedOrder: Order;
  const userStore = new UserStore();
  const orderStore = new OrderStore();
  beforeAll(async () => {
    user = await userStore.create({
      id: -1,
      firstName: 'hany',
      lastName: 'ageeb',
      password: 'pass',
      userName: 'us',
    });
    activeOrder = await orderStore.create({
      id: -1,
      date: new Date(),
      status: 'active',
      userId: user.id,
      user: undefined,
      lines: undefined,
    });
  });
  it('Should return 403', async () => {
    await request(app).get('/api/user_current_order/-1').expect(403);
  });
  it('Should return 404', async () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    await request(app)
      .get('/api/user_current_order/-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
  it('Should return 200', async () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    await request(app)
      .get(`/api/user_current_order/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
  afterAll(async () => {
    await orderStore.delete(activeOrder.id.toString());
    await userStore.delete(user.id.toString());
  });
});
describe('GET /api/user_completed_orders/:user_id', () => {
  const userStore = new UserStore();
  let user: User;
  beforeAll(async () => {
    user = await userStore.create({
      id: -1,
      userName: 'hany',
      password: '123',
      firstName: 'h',
      lastName: 'a',
    });
  });
  it('should return 403', async () => {
    await request(app).get('/api/user_completed_orders/1').expect(403);
  });
  it('should return 200', async () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    await request(app)
      .get('/api/user_completed_orders/1')
      .set('authorization', `Bearer ${token}`)
      .expect(200);
  });
  afterAll(async () => {
    await userStore.delete(user.id.toString());
  });
});
