import { configuration } from '../../database';
import { User, UserStore } from '../../models/user';

beforeAll(() => {
  configuration.environment = 'test';
});
const store = new UserStore();
let user: User;
describe('User Model', () => {
  it('Should has an index method', () => {
    expect(store.index).toBeDefined();
  });
  it('should has authenticate method', () => {
    expect(store.authenticate).toBeDefined();
  });
  it('index method should return a list of users', async () => {
    const result = await store.index();
    expect(result).toBeDefined();
  });
  it('show method should return null', async () => {
    const result = await store.show('-1');
    expect(result).toBeNull();
  });
  it('create method should return user with userName = hany0ageeb', async () => {
    user = await store.create({
      firstName: 'hany',
      lastName: 'ageeb',
      password: 'pass123',
      userName: 'hany0ageeb',
      id: -1,
    });
    expect(user.userName).toEqual('hany0ageeb');
    expect(user.id).toBeGreaterThan(0);
  });
  it(`authenticate method should return user `, async () => {
    const result = await store.authenticate('hany0ageeb', 'pass123');
    expect(result).toBeDefined();
  });
  it(`authenticate method should return null`, async () => {
    const result = await store.authenticate('hany_ageeb', 'pass1234');
    expect(result).toBeNull();
  });
  it('show mthod should return user with user name equal hany0ageeb', async () => {
    const result = await store.show(user.id.toString());
    expect(result).toBeTruthy();
    expect(result?.userName).toEqual('hany0ageeb');
  });
  it('delete method should return user with userNam = hany0ageeb', async () => {
    const result = await store.delete(user.id.toString());
    expect(result?.userName).toEqual(user.userName);
  });
});
