import { configuration, createClient } from '../../database';
import { Product, ProductStore } from '../../models/product';
import { clearDatabase, createProducts } from '../../tests/utility';

beforeAll(() => {
  configuration.environment = 'test';
});
describe('Product Model', () => {
  const products: Product[] = [];
  beforeAll(async () => {
    await clearDatabase(createClient());
    products.push(...(await createProducts(createClient())));
  });
  it('index should return an array', async () => {
    const productStore = new ProductStore();
    const results = await productStore.index();
    expect(results).toEqual(products);
  });
  it('show should return null', async () => {
    const productStore = new ProductStore();
    const result = await productStore.show('-1');
    expect(result).toBeNull();
  });
  it('show should return a product', async () => {
    const productStore = new ProductStore();
    const result = await productStore.show(products[0].id.toString());
    expect(result).toEqual(products[0]);
  });
  it('create should return a product with name xyz', async () => {
    const productStore = new ProductStore();
    const result = await productStore.create({
      id: -1,
      name: 'xyz',
      price: 10,
      category: 'ccc',
    });
    products.push(result);
    expect(result.name).toEqual('xyz');
  });
  it(`delete should return product`, async () => {
    const productStore = new ProductStore();
    const result = await productStore.delete(
      products[products.length - 1].id.toString(),
    );
    expect(result).not.toBeNull();
  });
  it(`delete should return null`, async () => {
    const productStore = new ProductStore();
    const result = await productStore.delete(
      products[products.length - 1].id.toString(),
    );
    expect(result).toBeNull();
  });
  it(`update should return null`, async () => {
    const productStore = new ProductStore();
    const result = await productStore.update({
      id: -1,
      name: 'p',
      price: 1,
      category: 'c',
    });
    expect(result).toBeNull();
  });
  it(`update should return a product with new values`, async () => {
    const productStore = new ProductStore();
    products[0].name = 'new_name';
    const result = await productStore.update(products[0]);
    expect(result).toEqual(products[0]);
  });
  it(`isProductHasOrders should return false`, async () => {
    const productStore = new ProductStore();
    const result = await productStore.isProductHasOrders(
      products[0].id.toString(),
    );
    expect(result).toBeFalse();
  });
  it(`getProductsByCategory should return an empty array`, async () => {
    const productStore = new ProductStore();
    const result = await productStore.getProductsByCategory(
      'fake category here',
    );
    expect(result).toEqual([]);
  });
  it(`getProductsByCategory should return array with 2 products`, async () => {
    const productStore = new ProductStore();
    const result = await productStore.getProductsByCategory('c1');
    expect(result.length).toEqual(2);
  });
  afterAll(async () => {
    await clearDatabase(createClient());
  });
});
afterAll(() => {
  configuration.environment = 'dev';
});
