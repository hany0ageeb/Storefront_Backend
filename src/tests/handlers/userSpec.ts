import express, { Application } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { configuration } from '../../database';
import { user_routes } from '../../handlers/user';
import { User, UserStore } from '../../models/user';

configuration.environment = 'test';
const app: Application = express();
user_routes(app);
describe('GET api/users', () => {
  it('should return 403', async () => {
    await request(app)
      .get('/api/users')
      .set('Content-Type', 'application/json')
      .expect(403);
  });
  it('Should return 200', async () => {
    const token = jwt.sign(
      { id: 1, userName: 'hany0' },
      <string>configuration.tokenSecret,
    );
    await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .expect(200);
  });
});
describe('POST /api/users', () => {
  it('Should return 422', async () => {
    const token = jwt.sign(
      { id: 1, userName: 'hany0' },
      <string>configuration.tokenSecret,
    );
    await request(app)
      .post('/api/users')
      .send({
        user: {
          id: -1,
          userName: '',
          firstName: '',
          lastName: '',
          password: '',
        },
        token: token,
      })
      .set('Content-Type', 'application/json')
      .expect(422);
  });
});
describe('GET api/users/:id', () => {
  let user: User;
  beforeAll(async () => {
    const store = new UserStore();
    user = await store.create({
      userName: 'hany',
      firstName: 'hany',
      lastName: 'hany',
      password: '123',
      id: -1,
    });
  });
  it('should return 403', async () => {
    await request(app)
      .get('/api/users/1')
      .set('Content-Type', 'application/json')
      .expect(403);
  });
  it('Should return 404', async () => {
    const token = jwt.sign(
      { id: 1, userName: 'hany0' },
      <string>configuration.tokenSecret,
    );
    await request(app)
      .get('/api/users/-1')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .expect(404);
  });
  it('Should return 200', async () => {
    const token = jwt.sign(
      { id: 1, userName: 'hany0' },
      <string>configuration.tokenSecret,
    );
    await request(app)
      .get(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .expect(200);
  });
  afterAll(async () => {
    const store = new UserStore();
    await store.delete(user.id.toString());
  });
});
