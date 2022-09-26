import express, { Application } from 'express';
import request from 'supertest';
import { clearDatabase, createUsres } from '../utility';
import { createClient } from '../../database';
import jwt from 'jsonwebtoken';
import { configuration } from '../../database';
import { user_routes } from '../../handlers/user';
import { User } from '../../models/user';

const app: Application = express();
app.use(express.json());
user_routes(app);

describe(`GET /api/users`, () => {
  it(`should return 403 when no token is provided`, () => {
    request(app)
      .get(`/api/users`)
      .expect(403)
      .end((_err, _res) => {});
  });
  it(`should return 200 when token is provided`, () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .get(`/api/users`)
      .set(`Authorization`, `Bearer ${token}`)
      .expect(200)
      .end((_err, _res) => {});
  });
});
describe(`GET /api/users/:id`, () => {
  const users: User[] = [];
  beforeAll(async () => {
    await clearDatabase(createClient());
    users.push(...(await createUsres(createClient())));
  });
  it(`should return 404 when user id is invalid`, () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .get(`/api/users/${users[0].id}`)
      .set(`Authorization`, `Bearer ${token}`)
      .expect(404)
      .end((_err, _res) => {});
  });
  it(`should return 403 when no token is provided`, () => {
    request(app)
      .get(`/api/users/${users[0].id}`)
      .expect(403)
      .end((_err, _res) => {});
  });
  it(`should return 200`, () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .get(`/api/users/${users[0].id}`)
      .set(`Authorization`, `Bearer ${token}`)
      .expect(200)
      .end((_err, _res) => {});
  });
});

describe(`POST /api/users`, () => {
  it(`should return 403 when no token is provided`, () => {
    request(app)
      .post(`/api/users`)
      .set('Content-Type', 'application/json')
      .send({
        user: {
          firstName: 'h_h',
          lastName: 'h_h',
          userName: '_h_',
          password: 'ppp',
        },
      })
      .expect(403)
      .end((_err, _res) => {});
  });
  it('shoudl return 200', () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .set(`Authorization`, `Bearer ${token}`)
      .send({
        user: {
          firstName: 'h_h',
          lastName: 'h_h',
          userName: '_h_',
          password: 'ppp',
        },
      })
      .expect(200)
      .end((_err, _req) => {});
  });
  it(`should return 422 when provided wiht invalid user input`, () => {
    const token = jwt.sign({ id: -1 }, <string>configuration.tokenSecret);
    request(app)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .set(`Authorization`, `Bearer ${token}`)
      .send({
        user: {
          firstName: 'h_h',
          lastName: 'h_h',
          userName: '',
          password: 'ppp',
        },
      })
      .expect(422)
      .end((_err, _req) => {});
  });
  afterAll(async () => {
    await clearDatabase(createClient());
  });
  describe('POST /api/users/signin', () => {
    let users: User[] = [];
    beforeAll(async () => {
      await clearDatabase(createClient());
      users = await createUsres(createClient());
    });
    it('should return 401', () => {
      request(app)
        .post('/api/users/signin')
        .set('Content-Type', 'application/json')
        .send({ userName: 'xfakex', password: 'fake' })
        .expect(401)
        .end((_err, _res) => {});
    });
    it('should return 200', () => {
      request(app)
        .post('/api/users/signin')
        .set('Content-Type', 'application/json')
        .send({ userName: 'u1', password: 'p1' })
        .expect(401)
        .end((_err, _res) => {});
    });
  });
});
