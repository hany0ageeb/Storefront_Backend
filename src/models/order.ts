import { createClient } from '../database';
import { Product } from './product';
import { User } from './user';

export interface Order {
  id: number;
  status: string;
  date: Date;
  userId: number;
  lines: OrderLine[] | undefined;
  user: User | undefined;
}
export interface OrderLine {
  id: number;
  productId: number;
  orderId: number;
  quantity: number;
  product: Product | undefined;
}
export class OrderStore {
  async index(pageSize?: number, pageNumber?: number): Promise<Order[]> {
    if (typeof pageNumber === 'undefined') pageNumber = 1;
    if (typeof pageSize === 'undefined') pageSize = 10;
    if (pageSize <= 0 || pageNumber < 1) {
      throw new Error(
        `Invalid Page Number and(or) Page Size: PageNumber = ${pageNumber} PageSize = ${pageSize}`,
      );
    }
    try {
      const connection = await createClient().connect();
      const sql = `SELECT orders.id, orders.date,orders.status,orders.user_id,users.firstname,users.lastname, users.username,users.password,order_product.id as line_id,order_product.product_id,order_product.quantity,products.name,products.price,products.category FROM orders LEFT JOIN order_product ON orders.id = order_product.order_id LEFT JOIN products ON order_product.product_id = products.id LEFT JOIN users ON users.id = orders.user_id ORDER BY orders.date DESC LIMIT ${pageSize} OFFSET ${
        (pageNumber - 1) * pageSize
      }`;
      const queryResult = await connection.query(sql);
      connection.release();
      const orders: Order[] = [];
      if (queryResult.rows.length) {
        queryResult.rows.forEach((row) => {
          if (!orders.find((ord) => ord.id === row.id)) {
            orders.push({
              id: row.id,
              date: row.date,
              status: row.status,
              userId: row.user_id,
              user: {
                id: row.user_id,
                firstName: row.firstname,
                lastName: row.lastname,
                userName: row.username,
                password: row.password,
              },
              lines: queryResult.rows
                .filter((e) => e.id === row.id && e.line_id)
                .map((l) => {
                  const line: OrderLine = {
                    id: l.line_id,
                    orderId: l.id,
                    productId: l.product_id,
                    quantity: l.quantity,
                    product: {
                      id: l.product_id,
                      name: l.name,
                      price: l.price,
                      category: l.category,
                    },
                  };
                  return line;
                }),
            });
          }
        });
      }
      return orders;
    } catch (err) {
      throw new Error(`Error While Retrieving list of orders....`);
    }
  }
  async create(order: Order): Promise<Order> {
    const connection = await createClient().connect();
    try {
      const newOrder: Order = {
        id: -1,
        date: order.date,
        status: order.status,
        userId: order.userId,
        user: order.user,
        lines: undefined,
      };
      if (order.lines) {
        newOrder.lines = [];
        newOrder.lines.push(...order.lines);
      }
      if (!order.user || order.user.id !== order.userId) {
        const q1 = await connection.query('SELECT * FROM users WHERE id = $1', [
          order.userId,
        ]);
        if (!q1.rows.length) {
          throw new Error(`No Such User: ${order.userId}`);
        } else {
          newOrder.user = {
            id: q1.rows[0].id,
            firstName: q1.rows[0].firstname,
            lastName: q1.rows[0].lastname,
            userName: q1.rows[0].username,
            password: q1.rows[0].password,
          };
        }
      }
      if (newOrder.lines) {
        newOrder.lines.forEach((line) => {
          if (!line.product || line.product.id !== line.productId) {
            connection
              .query('SELECT * FROM products WHERE id = $1', [line.productId])
              .then((q2) => {
                if (q2.rows.length) {
                  line.product = {
                    id: line.productId,
                    name: q2.rows[0].name,
                    price: q2.rows[0].price,
                    category: q2.rows[0].category,
                  };
                } else {
                  throw new Error(`No Such Product: ${line.productId}`);
                }
              })
              .catch((err) => {
                throw err;
              });
          }
        });
      }
      await connection.query('BEGIN');
      const sql =
        'INSERT INTO orders(user_id, status, date) VALUES ($1, $2, $3) RETURNING *';
      const queryResult = await connection.query(sql, [
        order.userId,
        newOrder.status,
        newOrder.date,
      ]);
      if (queryResult.rows.length) {
        newOrder.id = queryResult.rows[0].id;
        if (newOrder.lines) {
          for (const line of newOrder.lines) {
            //I should not call a wait inside a for loop ....
            const lineSql =
              'INSERT INTO order_product(order_id, product_id, quantity) VALUES ($1,$2,$3) RETURNING id';
            const result = await connection.query(lineSql, [
              queryResult.rows[0].id,
              line.productId,
              line.quantity,
            ]);
            if (result.rows.length) {
              line.id = result.rows[0].id;
            } else {
              throw new Error(
                `something went wrong while inserting line ${line.productId} ${line.quantity}`,
              );
            }
          }
        }
        await connection.query('COMMIT');
        return newOrder;
      } else {
        throw new Error('something went wrong while inserting the new Order.');
      }
    } catch (err) {
      await connection.query('ROLLBACK');
      throw err;
    } finally {
      connection.release();
    }
  }
  async show(orderId: string): Promise<Order | null> {
    const connection = await createClient().connect();
    try {
      const sql =
        'SELECT orders.id as order_id,orders.date, orders.status,orders.user_id,users.firstname,users.lastname,users.username,users.password,products.id as product_id,products.name as product_name,products.price,products.category,order_product.id as line_id FROM orders LEFT JOIN users ON orders.user_id = users.id LEFT JOIN order_product ON orders.id = order_product.order_id LEFT JOIN products ON products.id = order_product.product_id WHERE orders.id = $1';
      const queryResult = await connection.query(sql, [orderId]);

      if (queryResult.rows.length) {
        const order: Order = {
          id: queryResult.rows[0].order_id,
          date: queryResult.rows[0].date,
          status: queryResult.rows[0].status,
          userId: queryResult.rows[0].user_id,
          user: {
            firstName: queryResult.rows[0].firstname,
            lastName: queryResult.rows[0].lastname,
            id: queryResult.rows[0].user_id,
            userName: queryResult.rows[0].username,
            password: queryResult.rows[0].password,
          },
          lines: queryResult.rows
            .filter(
              (rows) =>
                rows.order_id === queryResult.rows[0].order_id && rows.line_id,
            )
            .map((l) => {
              const line: OrderLine = {
                id: l.line_id,
                orderId: l.order_id,
                productId: l.product_id,
                quantity: l.quantity,
                product: {
                  id: l.product_id,
                  name: l.product_name,
                  price: l.price,
                  category: l.category,
                },
              };
              return line;
            }),
        };
        return order;
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      throw new Error(
        'Error While Retreiving order# ' + orderId + ': ' + message,
      );
    } finally {
      connection.release();
    }
  }
  async delete(orderId: string): Promise<Order | null> {
    try {
      const connection = await createClient().connect();
      const sql = 'DELETE FROM orders where orders.id = $1 RETURNING *';
      const queryResult = await connection.query(sql, [orderId]);
      connection.release();
      if (queryResult.rows.length) {
        return {
          id: queryResult.rows[0].id,
          status: queryResult.rows[0].status,
          userId: queryResult.rows[0].user_id,
          date: queryResult.rows[0].date,
          user: undefined,
          lines: [],
        };
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(`Cannot delete Order# ${orderId} : ${err}`);
    }
  }
  async getUserRecentOrders(userId: string, limit?: number): Promise<Order[]> {
    try {
      const connection = await createClient().connect();
      if (typeof limit === 'undefined' || limit <= 0) limit = 5;
      const sql = `SELECT orders.id as id, orders.status, orders.date , orders.user_id as userId, users.firstname, users.lastname, users.username, users.password, order_product.id as line_id,order_product.quantity, order_product.product_id, products.name, products.price, products.category FROM orders LEFT JOIN users ON orders.user_id = users.id LEFT JOIN order_product ON orders.id = order_product.order_id LEFT JOIN products ON order_product.product_id = products.id WHERE user_id = $1 ORDER BY orders.date LIMIT ${limit}`;
      const queryResult = await connection.query(sql, [userId]);
      connection.release();
      if (queryResult.rows.length) {
        const orders: Order[] = [];
        queryResult.rows.forEach((row) => {
          if (!orders.find((ord) => ord.id === row.id)) {
            orders.push({
              id: row.id,
              date: row.date,
              status: row.status,
              userId: row.user_id,
              user: {
                id: row.user_id,
                firstName: row.firstname,
                lastName: row.lastname,
                userName: row.username,
                password: row.password,
              },
              lines: queryResult.rows
                .filter((e) => e.id === row.id && e.line_id)
                .map((l) => {
                  const line: OrderLine = {
                    id: l.line_id,
                    orderId: l.id,
                    productId: l.product_id,
                    quantity: l.quantity,
                    product: {
                      id: l.product_id,
                      name: l.name,
                      price: l.price,
                      category: l.category,
                    },
                  };
                  return line;
                }),
            });
          }
        });
        return orders;
      } else {
        return [];
      }
    } catch (err) {
      throw new Error(`${err}`);
    }
  }
  async getUserCurrentOrder(userId: string): Promise<Order | null> {
    try {
      const connection = await createClient().connect();
      const sql =
        "SELECT orders.id as id, orders.status, orders.date, orders.user_id as userId, users.firstname, users.lastname, users.username, users.password, order_product.id as lineId,order_product.quantity, order_product.order_id ,order_product.product_id, products.name, products.price, products.category FROM orders LEFT JOIN users ON orders.user_id = users.id LEFT JOIN order_product ON orders.id = order_product.order_id LEFT JOIN products ON order_product.product_id = products.id WHERE orders.user_id = $1 AND status = 'active'";
      const queryResult = await connection.query(sql, [userId]);
      connection.release();
      if (queryResult.rows.length) {
        const order: Order = {
          id: queryResult.rows[0].id,
          status: queryResult.rows[0].status,
          date: queryResult.rows[0].date,
          userId: queryResult.rows[0].user_id,
          user: {
            id: queryResult.rows[0].user_id,
            firstName: queryResult.rows[0].firstname,
            lastName: queryResult.rows[0].lastname,
            userName: queryResult.rows[0].username,
            password: queryResult.rows[0].password,
          },
          lines: queryResult.rows
            .filter((row) => {
              return (
                row.id === queryResult.rows[0].id &&
                row.order_id === queryResult.rows[0].id
              );
            })
            .map((row) => {
              const line: OrderLine = {
                id: row.lineId,
                orderId: row.id,
                quantity: row.quantity,
                productId: row.product_id,
                product: {
                  id: row.product_id,
                  name: row.name,
                  category: row.category,
                  price: row.price,
                },
              };
              return line;
            }),
        };
        return order;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(`${err}`);
    }
  }
  async getUserCompletedOrders(userId: string): Promise<Order[]> {
    try {
      const connection = await createClient().connect();
      const sql =
        "SELECT orders.id as id, orders.status, orders.user_id as userId, users.firstname, users.lastname, users.username, users.password, order_product.id as lineId,order_product.order_id,order_product.quantity, order_product.product_id, products.name, products.price, products.category FROM orders LEFT JOIN users ON orders.user_id = users.id LEFT JOIN order_product ON orders.id = order_product.order_id LEFT JOIN products ON order_product.product_id = products.id WHERE user_id = $1 AND status = 'complete'";
      const queryResult = await connection.query(sql, [userId]);
      connection.release();
      if (queryResult.rows.length) {
        const orders: Order[] = [];
        queryResult.rows.forEach((row) => {
          if (!orders.find((ord) => ord.id === row.id)) {
            orders.push({
              id: row.id,
              date: row.date,
              status: row.status,
              userId: row.user_id,
              user: {
                id: row.user_id,
                firstName: row.firstname,
                lastName: row.lastname,
                userName: row.username,
                password: row.password,
              },
              lines: queryResult.rows
                .filter((e) => e.order_id === row.id && e.lineId !== null)
                .map((l) => {
                  const line: OrderLine = {
                    id: l.lineId,
                    orderId: l.id,
                    productId: l.product_id,
                    quantity: l.quantity,
                    product: {
                      id: l.product_id,
                      name: l.name,
                      price: l.price,
                      category: l.category,
                    },
                  };
                  return line;
                }),
            });
          }
        });
        return orders;
      } else {
        return [];
      }
    } catch (err) {
      throw new Error(`${err}`);
    }
  }
  async addProduct(
    orderId: string,
    productId: string,
    quantity: number,
  ): Promise<OrderLine> {
    try {
      const connection = await createClient().connect();
      const sql =
        'INSERT INTO order_product (order_id, product_id, quantity) VALUES ($1,$2,$3) RETURNING *';
      const queryResult = await connection.query(sql, [
        orderId,
        productId,
        quantity,
      ]);
      connection.release();
      return {
        id: queryResult.rows[0].id,
        orderId: queryResult.rows[0].order_id,
        productId: queryResult.rows[0].product_id,
        quantity: queryResult.rows[0].quantity,
        product: undefined,
      };
    } catch (err) {
      throw new Error(`${err}`);
    }
  }
  async removeProduct(orderLineId: string): Promise<OrderLine | null> {
    try {
      const connection = await createClient().connect();
      const sql = 'DELETE FROM order_product WHERE id = $1 RETURNING *';
      const queryResult = await connection.query(sql, [orderLineId]);
      connection.release();
      if (queryResult.rows.length) {
        return {
          id: queryResult.rows[0].id,
          orderId: queryResult.rows[0].order_id,
          productId: queryResult.rows[0].product_id,
          quantity: queryResult.rows[0].quantity,
          product: undefined,
        };
      }
      return null;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }
}
