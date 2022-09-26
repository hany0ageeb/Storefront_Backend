import { Pool } from 'pg';
import { configuration } from '../database';
import { Product } from '../models/product';
import { User } from '../models/user';
import bcrypt from 'bcrypt';

export async function clearDatabase(client: Pool): Promise<void> {
  const connection = await client.connect();
  try {
    await connection.query('DELETE FROM orders');
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM products');
  } finally {
    connection.release();
  }
}
export async function seedTestData(
  client: Pool,
): Promise<{ products: Product[]; users: User[] }> {
  const products = [];
  const users = [];
  // 3
  products.push(...(await createProducts(client)));
  // 2
  users.push(...(await createUsres(client)));
  const connection = await client.connect();
  /*
    const orders: Order[] = [
      {
        id: -1,
        date: new Date('2021-05-10'),
        status: 'complete',
        user: users[0],
        userId: users[0].id,
        lines: [
          {
            id: -1,
            orderId: -1,
            productId: products[0].id,
            product: products[0],
            quantity: 2
          },
          {
            id: -1,
            orderId: -1,
            productId: products[1].id,
            product: products[1],
            quantity: 1
          }
        ]
      },
      {
        id: -1,
        date: new Date('2021-04-05'),
        status: 'complete',
        user: users[0],
        userId: users[0].id,
        lines: [
          {
            id: -1,
            orderId: -1,
            productId: products[1].id,
            product: products[1],
            quantity: 2
          },
          {
            id: -1,
            orderId: -1,
            productId: products[2].id,
            product: products[2],
            quantity: 1
          }
        ]
      }];
      */
  try {
    const orderInsertSql =
      "INSERT INTO orders(date, status, user_id) VALUES (TO_DATE($1,'YYYY-MM-DD'),$2,$3) RETURNING *";
    const orderLineInsertSql =
      'INSERT INTO order_product(order_id,product_id,quantity) VALUES ($1,$2,$3)';
    //1
    let queryResult = await connection.query(orderInsertSql, [
      '2021-06-10',
      'complete',
      users[0].id,
    ]);
    if (queryResult.rows.length) {
      //orders[0].id = Number(queryResult.rows[0].id);
      await connection.query(orderLineInsertSql, [
        queryResult.rows[0].id,
        products[0].id,
        2,
      ]);
      await connection.query(orderLineInsertSql, [
        queryResult.rows[0].id,
        products[1].id,
        1,
      ]);
    }
    //2
    queryResult = await connection.query(orderInsertSql, [
      '2021-05-05',
      'active',
      users[0].id,
    ]);
    if (queryResult.rows.length) {
      //orders[1].id = Number(queryResult.rows[0].id);
      await connection.query(orderLineInsertSql, [
        queryResult.rows[0].id,
        products[1].id,
        2,
      ]);
      await connection.query(orderLineInsertSql, [
        queryResult.rows[0].id,
        products[2].id,
        1,
      ]);
    }
    //3
    queryResult = await connection.query(orderInsertSql, [
      '2021-07-18',
      'complete',
      users[1].id,
    ]);
    if (queryResult.rows.length) {
      //orders[2].id = Number(queryResult.rows[0].id);
      await connection.query(orderLineInsertSql, [
        queryResult.rows[0].id,
        products[1].id,
        2,
      ]);
      await connection.query(orderLineInsertSql, [
        queryResult.rows[0].id,
        products[2].id,
        1,
      ]);
    }
    //4
    queryResult = await connection.query(orderInsertSql, [
      '2021-07-20',
      'complete',
      users[1].id,
    ]);
    if (queryResult.rows.length) {
      //orders[3].id = Number(queryResult.rows[0].id);
      await connection.query(orderLineInsertSql, [
        queryResult.rows[0].id,
        products[0].id,
        2,
      ]);
      await connection.query(orderLineInsertSql, [
        queryResult.rows[0].id,
        products[2].id,
        1,
      ]);
    }
    return {
      products: products,
      users: users,
      //orders: orders
    };
  } finally {
    connection.release();
  }
}
export async function createUsres(client: Pool): Promise<User[]> {
  const connection = await client.connect();
  const users: User[] = [];
  try {
    let hash = bcrypt.hashSync('p1', configuration.saltRound);
    let queryResult = await connection.query(
      'INSERT INTO users(username, firstname, lastname, password) VALUES ($1,$2,$3,$4) RETURNING *',
      ['u1', 'f1', 'l1', hash],
    );
    if (queryResult.rows.length) {
      users.push({
        id: queryResult.rows[0].id,
        firstName: queryResult.rows[0].firstname,
        lastName: queryResult.rows[0].lastname,
        userName: queryResult.rows[0].username,
        password: hash,
      });
    }
    hash = bcrypt.hashSync('p2', configuration.saltRound);
    queryResult = await connection.query(
      'INSERT INTO users(username, firstname, lastname, password) VALUES ($1,$2,$3,$4) RETURNING *',
      ['u2', 'f2', 'l2', hash],
    );
    if (queryResult.rows.length) {
      users.push({
        id: queryResult.rows[0].id,
        firstName: queryResult.rows[0].firstname,
        lastName: queryResult.rows[0].lastname,
        userName: queryResult.rows[0].username,
        password: hash,
      });
    }
    return users;
  } finally {
    connection.release();
  }
}
// .....
export async function createProducts(client: Pool): Promise<Product[]> {
  const products: Product[] = [
    {
      id: -1,
      name: 'p1',
      price: 20.0,
      category: 'c1',
    },
    {
      id: -1,
      name: 'p2',
      price: 10.0,
      category: 'c1',
    },
    {
      id: -1,
      name: 'p3',
      price: 10.0,
      category: 'c2',
    },
  ];
  const connection = await client.connect();
  try {
    const sql =
      'INSERT INTO products(name,price,category) VALUES ($1,$2,$3) RETURNING id';
    for (const product of products) {
      const queryResult = await connection.query(sql, [
        product.name,
        product.price,
        product.category,
      ]);
      if (queryResult.rows.length) {
        product.id = queryResult.rows[0].id;
      }
    }
    return products;
  } finally {
    connection.release();
  }
}
// .............................
