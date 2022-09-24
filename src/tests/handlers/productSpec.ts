import express, { Application } from 'express';
import request from 'supertest';
import { product_routes } from '../../handlers/product';
import { Product, ProductStore } from '../../models/product';
import jwt from 'jsonwebtoken';
import { configuration } from '../../database';

const app: Application = express();
app.use(express.json());
product_routes(app);
let product: Product;
describe('GET api/products', () => {
  it('should return 200', async () => {
    await request(app).get('/api/products').expect(200);
  });
  it('should respond with json', async () => {
    await request(app)
      .get('/api/products')
      .expect('Content-Type', 'application/json; charset=utf-8');
  });
});
describe('GET api/products/:id', () => {
  const store = new ProductStore();
  beforeAll(async () => {
    product = await store.create({
      id: -1,
      name: 'p1',
      price: 1,
      category: 'cat1',
    });
  });
  it('should return 404', async () => {
    await request(app).get('/api/products/-1').expect(404);
  });
  it('should return 200', async () => {
    await request(app).get(`/api/products/${product.id}`).expect(200);
  });
  afterAll(async () => {
    await store.delete(product.id.toString());
  });
});
describe('GET api/products/top_products?limit=5', () => {
  it('should return 200', async () => {
    await request(app).get('api/products/top_products?limit=5').expect(200);
  });
});
describe('POST api/products', () => {
  it('Should return 422', async () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    await request(app)
      .post('/api/products')
      .send({ product: { name: '', price: 1, category: 'cat1', id: -1 } })
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect(422);
  });
  it('Should return 422', async () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    await request(app)
      .post('/api/products')
      .send({ product: { name: 'pla', price: 0, category: 'cat1', id: -1 } })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
  it('should return 403', async () => {
    await request(app)
      .post('/api/products')
      .send({ product: { name: 'xyz', price: 1, category: 'cat1', id: -1 } })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(403);
  });
  it('should return 200', async () => {
    const token = jwt.sign(
      { id: 1, userName: 'hany0ageeb', firstName: 'hany', lastName: 'ageeb' },
      <string>configuration.tokenSecret,
    );
    await request(app)
      .post('/api/products')
      .send({
        product: { name: 'xyz', price: 1, category: 'cat1', id: -1 },
      })
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect(200);
  });
});
