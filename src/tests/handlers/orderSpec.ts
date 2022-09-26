import express, { Application } from 'express';
import request from 'supertest';
import {
  clearDatabase,
  createProducts,
  createUsres,
  seedTestData,
} from '../utility';
import { createClient } from '../../database';
import jwt from 'jsonwebtoken';
import { configuration } from '../../database';
import { order_routes } from '../../handlers/order';
import { Order, OrderLine, OrderStore } from '../../models/order';
import { User, UserStore } from '../../models/user';
import { Product, ProductStore } from '../../models/product';

const app: Application = express();
app.use(express.json());
order_routes(app);
beforeAll(() => {
  configuration.environment = 'test';
});
describe('GET /api/orders', () => {
  it('should return 200', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end((_err, _req) => {});
  });
  it('should return 403', () => {
    request(app)
      .get('/api/orders')
      .expect(403)
      .end((_err, _req) => {});
  });
});
describe('GET /api/orders/:id', () => {
  let orders: Order[];

  beforeAll(async () => {
    await clearDatabase(createClient());
    await seedTestData(createClient());
    orders = await new OrderStore().index();
  });
  it('Should return 200', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .get(`/api/orders/${orders[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end((_err, _res) => {});
  });
  it('Should return 404', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .get(`/api/orders/x`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .end((_err, _res) => {});
  });
  it('should return 403', () => {
    request(app)
      .get(`/api/orders/${orders[0].id}`)
      .expect(403)
      .end((_err, _res) => {});
  });
  afterAll(async () => {
    await clearDatabase(createClient());
  });
});

describe('POST /api/orders', () => {
  let users: User[];
  let products: Product[];
  beforeAll(async () => {
    await clearDatabase(createClient());
    users = await createUsres(createClient());
    products = await createProducts(createClient());
  });
  it('should return 403', () => {
    request(app)
      .post('/api/orders')
      .set('Content-Type', 'application/json')
      .send({ order: {} })
      .expect(403)
      .end((_err, _req) => {});
  });
  it('should return 422', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        order: { date: '2021-06-05', status: 'pla', user_id: 2, lines: [] },
      })
      .expect(403)
      .end((_err, _req) => {});
  });
  it('should return 200', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        order: {
          date: '2021-06-05',
          status: 'pla',
          user_id: users[0].id,
          lines: [
            {
              id: -1,
              product: products[0],
              productId: products[0].id,
              quantity: 1,
            },
          ],
        },
      })
      .expect(200)
      .end((_err, _req) => {});
  });
});

describe('DELETE /api/orders/:id', () => {
  let orders: Order[];
  beforeAll(async () => {
    await clearDatabase(createClient());
    await seedTestData(createClient());
    orders = await new OrderStore().index();
  });
  it('should return 403', () => {
    request(app)
      .delete(`/api/orders/${orders[0].id}`)
      .expect(403)
      .end((_err, _res) => {});
  });
  it('should return 404', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .delete(`/api/orders/x`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .end((_err, _res) => {});
  });
  it('should return 200', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .delete(`/api/orders/${orders[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end((_err, _res) => {});
  });
});
describe('GET /api/user_current_order/:userId', () => {
  let users: User[];
  beforeAll(async () => {
    await clearDatabase(createClient());
    await seedTestData(createClient());
    users = await new UserStore().index();
  });
  it('should return 200', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .get(`/api/user_current_order/${users[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end((_err, _res) => {});
  });
  it('should return 403', () => {
    request(app)
      .get(`/api/user_current_order/${users[0].id}`)
      .expect(200)
      .end((_err, _res) => {});
  });
});

describe('GET /api/user_completed_orders/:userId', () => {
  let users: User[];
  beforeAll(async () => {
    await clearDatabase(createClient());
    await seedTestData(createClient());
    users = await new UserStore().index();
  });
  it('should return 200', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .get(`/api/user_completed_orders/${users[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end((_err, _res) => {});
  });
  it('should return 403', () => {
    request(app)
      .get(`/api/user_completed_orders/${users[0].id}`)
      .expect(200)
      .end((_err, _res) => {});
  });
});
describe('POST /api/orders/:id/products', () => {
  let orders: Order[];
  let products: Product[];
  beforeAll(async () => {
    await clearDatabase(createClient());
    await seedTestData(createClient());
    orders = await new OrderStore().index();
    products = await new ProductStore().index();
  });
  it('should return 403', () => {
    request(app)
      .post(`/api/orders/${orders[0].id}/product`)
      .expect(403)
      .end((_err, _res) => {});
  });
  it('should return 200', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .post(`/api/orders/${orders[0].id}/product`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .send({
        line: {
          productId: products[0].id,
          quantity: 1,
        },
      })
      .end((_err, _res) => {});
  });
});

describe('DELETE /api/orders/products/:lineId', () => {
  let line: OrderLine;
  beforeAll(async () => {
    await clearDatabase(createClient());
    await seedTestData(createClient());
    const order = (await new OrderStore().index()).find(
      (o) => o.lines !== undefined && o.lines.length > 0,
    );
    if (order && order.lines && order.lines.length) line = order.lines[0];
  });
  it('should return 403', () => {
    request(app)
      .delete(`/api/orders/products/${line.id}`)
      .expect(403)
      .end((_err, _res) => {});
  });
  it('should return 200', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .delete(`/api/orders/products/${line.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end((_err, _res) => {});
  });
});
