import { createClient } from '../../database';
import { User, UserStore } from '../../models/user';
import { clearDatabase, createUsres } from '../../tests/utility';

describe('User Model', () => {
  const users: User[] = [];
  beforeAll(async () => {
    await clearDatabase(createClient());
    users.push(...(await createUsres(createClient())));
  });
  it(`index should return array of 2 users`, async () => {
    const userStore = new UserStore();
    const result = await userStore.index();
    expect(result).toEqual(users);
  });
  it(`show should return user`, async () => {
    const userStore = new UserStore();
    const result = await userStore.show(users[0].id.toString());
    expect(result).toEqual(users[0]);
  });
  it(`show should return null`, async () => {
    const userStore = new UserStore();
    const result = await userStore.show('-1');
    expect(result).toBeNull();
  });
  it(`create should return a user with userName fake_user`, async () => {
    const userStore = new UserStore();
    const result = await userStore.create({
      id: -1,
      userName: 'fake_user',
      firstName: 'fir',
      lastName: 'las',
      password: 'pla',
    });
    users.push(result);
    expect(result.userName).toEqual('fake_user');
  });
  it(`delete should return null`, async () => {
    const userStore = new UserStore();
    const result = await userStore.delete('-1');
    expect(result).toBeNull();
  });
  it(`delete should return the deleted user`, async () => {
    const userStore = new UserStore();
    const result = await userStore.delete(
      users[users.length - 1].id.toString(),
    );
    expect(result).not.toBeNull();
  });
  it(`update should return null`, async () => {
    const userStore = new UserStore();
    const result = await userStore.update({
      id: -1,
      firstName: '',
      lastName: '',
      userName: '',
      password: '',
    });
    expect(result).toBeNull();
  });
  it(`update should return updated user`, async () => {
    const userStore = new UserStore();
    users[0].userName = 'new_u_name';
    users[0].password = 'p1';
    const result = await userStore.update(users[0]);
    if (result !== null) users[0] = result;
    expect(result).not.toBeNull();
  });
  it(`authenticate should return null`, async () => {
    const userStore = new UserStore();
    const result = await userStore.authenticate('fake', 'fake');
    expect(result).toBeNull();
  });
  it(`authenticate should return user`, async () => {
    const userStore = new UserStore();
    const result = await userStore.authenticate(users[0].userName, 'p1');
    expect(result).toEqual(users[0]);
  });
  afterAll(async () => {
    await clearDatabase(createClient());
  });
});
