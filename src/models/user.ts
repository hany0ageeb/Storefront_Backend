import { createClient, configuration } from '../database';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  password: string;
}
export class UserStore {
  async index(): Promise<User[]> {
    try {
      const connection = await createClient().connect();
      const sql = 'SELECT * FROM users';
      const queryResult = await connection.query(sql);
      connection.release();
      const result: User[] = queryResult.rows.map((itm) => {
        return {
          id: itm.id,
          firstName: itm.firstname,
          lastName: itm.lastname,
          userName: itm.username,
          password: itm.password,
        };
      });
      return result;
    } catch (err) {
      throw new Error(`Could not retrieve the list of users: ${err}`);
    }
  }
  async show(id: string): Promise<User | null> {
    try {
      const connection = await createClient().connect();
      const sql = 'SELECT * FROM users WHERE id = $1';
      const queryResult = await connection.query(sql, [id]);
      connection.release();
      if (queryResult.rows.length > 0) {
        const user: User = {
          id: queryResult.rows[0].id,
          firstName: queryResult.rows[0].firstname,
          lastName: queryResult.rows[0].lastname,
          password: queryResult.rows[0].password,
          userName: queryResult.rows[0].username,
        };
        return user;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(`Could not retrieve user ${id}: ${err}`);
    }
  }
  async create(user: User): Promise<User> {
    try {
      const connection = await createClient().connect();
      const sql =
        'INSERT INTO users(userName, firstName, lastName, password) VALUES ($1, $2, $3, $4) RETURNING *';
      const hash = bcrypt.hashSync(user.password, configuration.saltRound);
      const queryResult = await connection.query(sql, [
        user.userName,
        user.firstName,
        user.lastName,
        hash,
      ]);
      connection.release();
      return {
        id: queryResult.rows[0].id,
        firstName: queryResult.rows[0].firstname,
        lastName: queryResult.rows[0].lastname,
        password: queryResult.rows[0].password,
        userName: queryResult.rows[0].username,
      };
    } catch (err) {
      throw new Error(
        `Could not Create the new User [User Name = ${user.userName}]: ${err}`,
      );
    }
  }
  async delete(userId: string): Promise<User | null> {
    try {
      const connection = await createClient().connect();
      const sql = 'DELETE FROM users where id = $1 RETURNING *';
      const queryResult = await connection.query(sql, [userId]);
      connection.release();
      if (queryResult.rows.length) {
        return {
          id: queryResult.rows[0].id,
          firstName: queryResult.rows[0].firstname,
          lastName: queryResult.rows[0].lastname,
          password: queryResult.rows[0].password,
          userName: queryResult.rows[0].username,
        };
      } else return null;
    } catch (err) {
      throw new Error(`Cannot Delete User With id ${userId} : ${err}`);
    }
  }
  async authenticate(userName: string, password: string): Promise<User | null> {
    try {
      const connection = await createClient().connect();
      const sql = 'SELECT * FROM users WHERE username = $1';
      const queryResult = await connection.query(sql, [userName]);
      connection.release();
      if (queryResult.rows.length) {
        const user: User = {
          id: queryResult.rows[0].id,
          firstName: queryResult.rows[0].firstname,
          lastName: queryResult.rows[0].lastname,
          userName: queryResult.rows[0].username,
          password: queryResult.rows[0].password,
        };
        if (bcrypt.compareSync(password, user.password)) {
          return user;
        }
      }
      return null;
    } catch (err) {
      throw new Error(
        `An Error occured while authenticating user ${userName}: ${err}`,
      );
    }
  }
}
