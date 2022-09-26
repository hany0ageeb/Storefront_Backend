import { createClient } from '../../database';
import { Order, OrderStore } from '../../models/order';
import { Product } from '../../models/product';
import { User } from '../../models/user';
import { clearDatabase, seedTestData } from '../utility';

describe(`Order Model`, () => {
  const orders: Order[] = [];
  let seedData: { products: Product[]; users: User[] };
  beforeAll(async () => {
    await clearDatabase(createClient());
    seedData = await seedTestData(createClient());
  });
  it(`Index should return an array of length 4`, async () => {
    const orderStore = new OrderStore();
    const result = await orderStore.index();
    expect(result.length).toEqual(4);
    orders.push(...result);
  });
  it(`show should return null`, async () => {
    const orderstore = new OrderStore();
    const result = await orderstore.show('-1');
    expect(result).toBeNull();
  });
  it(`show should return an order`, async () => {
    const orderStore = new OrderStore();
    const result = await orderStore.show(orders[0].id.toString());
    expect(result).toEqual(orders[0]);
  });
  it(`getUserRecentOrders should return empty array`, async () => {
    const orderStore = new OrderStore();
    const result = await orderStore.getUserRecentOrders('-1');
    expect(result).toEqual([]);
  });
  it(`getUserRecentOrders should return array of length 1`, async () => {
    const orderStore = new OrderStore();
    const result = await orderStore.getUserRecentOrders(
      seedData.users[1].id.toString(),
      1,
    );
    expect(result.length).toEqual(1);
  });
  it(`getUserRecentOrders should return array of length 2`, async () => {
    const orderStore = new OrderStore();
    const result = await orderStore.getUserRecentOrders(
      seedData.users[1].id.toString(),
      2,
    );
    expect(result.length).toEqual(2);
  });
  it(`getUserCurrentOrder should return null`, async () => {
    const orderStore = new OrderStore();
    const result = await orderStore.getUserCurrentOrder(
      seedData.users[1].id.toString(),
    );
    expect(result).toBeNull();
  });
  it(`getUserCurrentOrder should return an order`, async () => {
    const orderStore = new OrderStore();
    const result = await orderStore.getUserCurrentOrder(
      seedData.users[0].id.toString(),
    );
    expect(result).toBeDefined();
  });
  it(`getUserCompletedOrders should return an array of length 1`, async () => {
    const orderStore = new OrderStore();
    const result = await orderStore.getUserCompletedOrders(
      seedData.users[0].id.toString(),
    );
    expect(result.length).toEqual(1);
  });
  it(`getUserCompletedOrders should return an array of length 2`, async () => {
    const orderStore = new OrderStore();
    const result = await orderStore.getUserCompletedOrders(
      seedData.users[1].id.toString(),
    );
    expect(result.length).toEqual(2);
  });
  it(`delete should return null`, async () => {
    const orderStore = new OrderStore();
    const result = await orderStore.delete('-1');
    expect(result).toBeNull();
  });
  it(`delete should return order`, async () => {
    const orderStore = new OrderStore();
    const result = await orderStore.delete(orders[0].id.toString());
    expect(result).toEqual(orders[0]);
  });
  afterAll(async () => {
    await clearDatabase(createClient());
  });
});
