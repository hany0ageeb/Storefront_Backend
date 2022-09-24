import { configuration, createClient } from '../../database';
import { OrderLine, OrderStore } from '../../models/order';

let client;
beforeAll(async () => {
  configuration.environment = 'test';
  client = await createClient().connect();
  //clear all data fisrt ...
  await client.query('DELETE FROM ORDERS');
  await client.query('DELETE FROM USERS');
  await client.query('DELETE FROM PRODUCTS');
  // seed with data ....

  await client.query(
    "INSERT INTO users (username,firstname,lastname,password) VALUES('u1','f1','l1','p1') RETURNING id",
  );
  await client.query(
    "INSERT INTO users (username,firstname,lastname,password) VALUES('u2','f2','l2','p2') RETURNING id",
  );
  await client.query(
    "INSERT INTO products(name,price,category) VALUES('p1',1,'c1')",
  );
  await client.query(
    "INSERT INTO products(name,price,category) VALUES('p2',10,'c2')",
  );
  client.release();
});
describe('Order Model', () => {
  const orderStore = new OrderStore();
  it('create should return an order', async () => {
    const order = await orderStore.create({
      id: -1,
      date: new Date(),
      status: 'active',
      userId: 1,
      user: undefined,
      lines: [
        {
          id: -1,
          orderId: -1,
          productId: 1,
          product: undefined,
          quantity: 1,
        },
      ],
    });
    const result = await orderStore.create(order);
    expect(result).toBeDefined();
    expect(result.lines?.length).toEqual(1);
    expect(result.id).toBeGreaterThan(0);
  });
  it('create should throw an error', async () => {
    const order = await orderStore.create({
      id: -1,
      date: new Date(),
      status: 'active',
      userId: -1,
      user: undefined,
      lines: [
        {
          id: -1,
          orderId: -1,
          productId: 1,
          product: undefined,
          quantity: 1,
        },
      ],
    });
    expect(async () => {
      await orderStore.create(order);
    }).toThrow();
  });
  it('index should return an array', async () => {
    const result = await orderStore.index();
    expect(result).toBeDefined();
  });
  it('show should return an order with id = 1', async () => {
    const result = await orderStore.show('1');
    expect(result).toBeDefined();
    if (result !== null) expect(result.id).toBe(1);
  });
  it('show should return null', async () => {
    const result = await orderStore.show('-1');
    expect(result).toBeNull();
  });
  it('getUserRecentOrders should return an array of 1', async () => {
    const result = await orderStore.getUserRecentOrders('1', 1);
    expect(result).toBeDefined();
    expect(result.length).toEqual(1);
  });
  it('getUserCurrentOrder should return an order', async () => {
    const result = await orderStore.getUserCurrentOrder('1');
    expect(result).toBeDefined();
  });
  it('getUserCurrentOrder should return null', async () => {
    const result = await orderStore.getUserCurrentOrder('-1');
    expect(result).toBeNull();
  });
  let orderLine: OrderLine;
  it('addProduct should return a line', async () => {
    orderLine = await orderStore.addProduct('1', '1', 1);
    expect(orderLine).toBeDefined();
  });
  it('removeProduct should return line', async () => {
    const result = await orderStore.removeProduct(orderLine.id.toString());
    expect(result).toBeDefined();
  });
  it('removeProduct should return null', async () => {
    const result = await orderStore.removeProduct(orderLine.id.toString());
    expect(result).toBeNull();
  });
  it('delete should return an order with id = 1', async () => {
    const result = await orderStore.delete('1');
    expect(result).toBeDefined();
    if (result !== null) expect(result.id).toBe(1);
  });

  it('getUserCompletedOrders should return an empty array', async () => {
    const result = await orderStore.getUserCompletedOrders('1');
    expect(result).toBeDefined();
  });
});
