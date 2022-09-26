import { createClient } from '../database';
import { OrderLine } from './order';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}
export class ProductStore {
  async index(): Promise<Product[]> {
    try {
      const connection = await createClient().connect();
      const sql = 'SELECT * FROM products';
      const queryResult = await connection.query(sql);
      connection.release();
      return queryResult.rows.map((row) => {
        return {
          id: row.id,
          name: row.name,
          price: Number(row.price),
          category: row.category,
        };
      });
    } catch (err) {
      throw new Error(`Cannot retrive the list of products: ${err}`);
    }
  }
  async show(id: string): Promise<Product | null> {
    try {
      const connection = await createClient().connect();
      const sql = 'SELECT * FROM products WHERE id = $1';
      const queryResult = await connection.query(sql, [id]);
      connection.release();
      if (queryResult.rows.length)
        return {
          id: queryResult.rows[0].id,
          name: queryResult.rows[0].name,
          price: Number(queryResult.rows[0].price),
          category: queryResult.rows[0].category,
        };
      else return null;
    } catch (err) {
      throw new Error(`Cannot retrieve Product with id ${id}: ${err}`);
    }
  }
  async create(product: Product): Promise<Product> {
    try {
      const connection = await createClient().connect();
      const sql =
        'INSERT INTO products(name, price, category) VALUES ($1,$2,$3) RETURNING *';
      const queryResult = await connection.query(sql, [
        product.name,
        product.price,
        product.category,
      ]);
      connection.release();
      return {
        id: queryResult.rows[0].id,
        name: queryResult.rows[0].name,
        category: queryResult.rows[0].category,
        price: Number(queryResult.rows[0].price),
      };
    } catch (err) {
      throw new Error(`Could not create product ${product.name} : ${err}`);
    }
  }
  async delete(productId: string): Promise<Product | null> {
    try {
      const connection = await createClient().connect();
      const sql = 'DELETE FROM products WHERE id = $1 RETURNING *';
      const queryResult = await connection.query(sql, [productId]);
      connection.release();
      if (queryResult.rows.length) {
        return {
          id: queryResult.rows[0].id,
          name: queryResult.rows[0].name,
          price: queryResult.rows[0].price,
          category: queryResult.rows[0].category,
        };
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(`Could not delete product ${productId} : ${err}`);
    }
  }
  async update(product: Product): Promise<Product | null> {
    const connection = await createClient().connect();
    try {
      const sql =
        'UPDATE products SET name=$1, price=$2, category=$3 WHERE id=$4 RETURNING *';
      const queryResult = await connection.query(sql, [
        product.name,
        product.price,
        product.category,
        product.id,
      ]);
      if (queryResult.rows.length > 0) {
        return {
          id: queryResult.rows[0].id,
          name: queryResult.rows[0].name,
          price: Number(queryResult.rows[0].price),
          category: queryResult.rows[0].category,
        };
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(`Cannot Update Product: ${err}`);
    } finally {
      connection.release();
    }
  }
  async isProductHasOrders(productId: string): Promise<boolean> {
    const connection = await createClient().connect();
    try {
      const sql =
        'SELECT COALESCE(count(id), 0) as product_order_lines_count from order_product WHERE product_id = $1';
      const queryResult = await connection.query(sql, [productId]);
      return queryResult.rows[0].product_order_lines_count > 0;
    } finally {
      connection.release();
    }
  }
  async getProductOrderLines(productId: string): Promise<OrderLine[]> {
    const connection = await createClient().connect();
    try {
      const sql =
        'SELECT order_product.id,order_product.order_id,order_product.product_id, order_product.quantity, products.name, products.price, products.category FROM order_product JOIN products ON order_product.product_id = products.id WHERE order_product.product_id = $1';
      const queryResult = await connection.query(sql);
      return queryResult.rows.map((row) => {
        const line: OrderLine = {
          id: row.id,
          productId: row.product_id,
          quantity: row.quantity,
          orderId: row.order_id,
          product: {
            id: row.product_id,
            name: row.name,
            price: Number(row.price),
            category: row.category,
          },
        };
        return line;
      });
    } catch (err) {
      throw new Error(`Could not retrieve product ${productId} Orders: ${err}`);
    } finally {
      connection.release();
    }
  }
  async getProductsByCategory(productCategory: string): Promise<Product[]> {
    try {
      const connection = await createClient().connect();
      const sql = 'SELECT * FROM products WHERE category = $1';
      const queryResult = await connection.query(sql, [productCategory]);
      connection.release();
      return queryResult.rows.map((row) => {
        return {
          id: row.id,
          name: row.name,
          price: row.price,
          category: row.category,
        };
      });
    } catch (err) {
      throw new Error(
        `could not retrieve category ${productCategory} list of products: ${err}`,
      );
    }
  }
  async getTopProducts(limit?: number): Promise<Product[]> {
    try {
      const connection = await createClient().connect();
      if (typeof limit === 'undefined' || limit <= 0) limit = 5;
      const sql = `SELECT products.* FROM products JOIN (SELECT order_product.product_id, SUM(order_product.quantity) as total_orderd_quantity FROM order_product GROUP BY order_product.product_id ORDER BY total_orderd_quantity DESC LIMIT ${limit} ) as top_5_products ON products.id = top_5_products.product_id ORDER BY products.name`;
      const queryResult = await connection.query(sql);
      connection.release();
      return queryResult.rows.map((row) => {
        return {
          id: row.id,
          name: row.name,
          price: row.price,
          category: row.category,
        };
      });
    } catch (err) {
      throw new Error(`Could not Retrieve The Top  Products: ${err}`);
    }
  }
}
