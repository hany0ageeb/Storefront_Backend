import { Product, ProductStore } from '../../models/product';

const store = new ProductStore();
let product: Product;
describe('Product Model', () => {
  it('get Top products', async () => {
    const result = await store.getTopProducts(5);
    expect(result).toBeDefined();
  });
  it('index method should return a list or products', async () => {
    const result = await store.index();
    expect(result).toBeDefined();
  });
  it('show mthod should return null', async () => {
    const result = await store.show('-1');
    expect(result).toBeNull();
  });
  it('create should return product with name = P1', async () => {
    product = await store.create({
      name: 'P1',
      price: 50,
      category: 'cat1',
      id: -1,
    });
    expect(product.name).toEqual('P1');
  });
  it('show method should return product with name P1', async () => {
    const result = await store.show(product.id.toString());
    expect(result?.name).toEqual('P1');
  });
  it('show method should return null', async () => {
    const result = await store.show('-1');
    expect(result).toBeNull();
  });
  it('delete should return product with name P1', async () => {
    const result = await store.delete(product.id.toString());
    expect(result?.name).toEqual('P1');
  });
});
