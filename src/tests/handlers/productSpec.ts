import express, { Application } from 'express';
import { product_routes } from '../../handlers/product';
import request from 'supertest';
import { Product } from '../../models/product';
import { clearDatabase, createProducts } from '../utility';
import { createClient } from '../../database';
import jwt from 'jsonwebtoken';
import { configuration } from '../../database';

const app: Application = express();
app.use(express.json());
product_routes(app);
beforeAll(() => {
  configuration.environment = 'test';
});
describe(`GET /api/products`, () => {
  it(`should return 200`, () => {
    request(app)
      .get('/api/products')
      .set('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((_err, _res) => {
        //if(err)
        //throw err;
        //console.log(err);
      });
  });
  it(`should respond with json`, () => {
    request(app)
      .get('/api/products')
      .set('Content-Type', 'application/json; charset=utf-8')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((_err, _res) => {
        //if(err)
        //throw err;
        //console.log(err);
      });
  });
});

describe(`GET /api/products/:id`, () => {
  let products: Product[];
  beforeAll(async () => {
    await clearDatabase(createClient());
    products = await createProducts(createClient());
  });
  it(`should return 200`, () => {
    request(app)
      .get(`/api/products/${products[0].id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((_err, _res) => {
        //if(err)
        //throw err;
        //console.log(err);
      });
  });
  it(`should return 404 when product id is invalid`, () => {
    request(app)
      .get(`/api/products/x`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((_err, _res) => {
        //if(err)
        //throw err;
        //console.log(err);
      });
  });
  afterAll(async () => {
    await clearDatabase(createClient());
  });
});

describe(`POST /api/products`, () => {
  it(`should return 403 when no token is provided`, () => {
    request(app)
      .post(`/api/products`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ id: -1, name: 'xyz', price: 1, category: 'xxx' })
      .expect(403)
      .end((_err, _res) => {
        //if(err)
        //throw err;
        //console.log(err);
      });
  });
  it(`should return 422 when provided product name is empty`, () => {
    request(app)
      .post(`/api/products`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ id: -1, name: '', price: 1, category: 'xxx' })
      .expect(422)
      .end((_err, _res) => {
        //if(err)
        //throw err;
        //console.log(err);
      });
  });
  it(`should return 422 when provided product price is less than zero`, () => {
    request(app)
      .post(`/api/products`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ id: -1, name: 'xxx', price: -1, category: 'xxx' })
      .expect(422)
      .end((_err, _res) => {
        //if(err)
        //throw err;
        //console.log(err);
      });
  });
  it(`should return 200`, () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .post(`/api/products`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set(`Authorization`, `Bearer ${token}`)
      .send({ id: -1, name: 'xyz', price: 1, category: 'xxx' })
      .expect(200)
      .end((_err, _res) => {
        //if(err)
        //throw err;
        //console.log(err);
      });
  });
});
describe(`GET /api/products/category/:categoryName`, () => {
  it(`should return 200`, () => {
    request(app)
      .get(`/api/products/category/cc`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((_err, _res) => {
        //if(err)
        //  throw err;
      });
  });
  it(`should respond with json`, () => {
    request(app)
      .get(`/api/products/category/cc`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .expect('Content-Type', 'application/json')
      .end((_err, _res) => {
        //if(err)
        //  throw err;
      });
  });
});
describe(`GET /api/top_products`, () => {
  it(`should return 200`, () => {
    request(app)
      .get('/api/top_products')
      .set('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((_err, _res) => {
        //if(err)
        //throw err;
      });
  });
  it(`should respond with json`, () => {
    request(app)
      .get('/api/top_products')
      .set('Content-Type', 'application/json; charset=utf-8')
      .expect('Content-Type', 'application/json')
      .end((_err, _res) => {
        //if(err)
        //  throw err;
      });
  });
});
describe(`PUT /api/products/:id`, () => {
  const products: Product[] = [];
  beforeAll(async () => {
    await clearDatabase(createClient());
    products.push(...(await createProducts(createClient())));
  });
  it(`should return 403 when no token is provided`, () => {
    request(app)
      .put(`/api/products/${products[0].id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ request: { name: '8', price: 1, category: 'c' } })
      .expect(403)
      .end((_err, _res) => {
        //if(err)
        //  throw err;
      });
  });
  it(`Should return 404 when product id is invalid`, () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .put(`/api/products/-1`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', `Bearer ${token}`)
      .send({ request: { name: '8', price: 1, category: 'c' } })
      .expect(404)
      .end((_err, _res) => {
        //if(err)
        //  throw err;
      });
  });
  it(`Should return 400 when product name is empty`, () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .put(`/api/products/-1`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', `Bearer ${token}`)
      .send({ request: { name: '', price: 1, category: 'c' } })
      .expect(400)
      .end((_err, _res) => {
        //if(err)
        //  throw err;
      });
  });
  it(`Should return 200`, () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .put(`/api/products/-1`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', `Bearer ${token}`)
      .send({ request: { name: 'xxxxxx', price: 1, category: 'c' } })
      .expect(200)
      .end((_err, _res) => {
        //if(err)
        //  throw err;
      });
  });
});
describe(`DELETE /api/products/:id`, () => {
  const products: Product[] = [];
  beforeAll(async () => {
    await clearDatabase(createClient());
    products.push(...(await createProducts(createClient())));
  });
  it(`should return 403 when no token is provided`, () => {
    request(app)
      .delete(`/api/products/${products[0].id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .expect(403)
      .end((_err, _res) => {
        //if(err)
        //  throw err;
      });
  });
  it(`should return 404 when product id is invalid`, () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .delete(`/api/products/-1`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .end((_err, _res) => {
        //if(err)
        //  throw err;
      });
  });
  it(`should return 200`, () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .delete(`/api/products/${products[0].id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end((_err, _res) => {
        //if(err)
        //  throw err;
      });
  });
});
