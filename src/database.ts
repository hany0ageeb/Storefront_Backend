import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();
export interface ApplicationConfiguration {
  host: string | undefined;
  database: string | undefined;
  user: string | undefined;
  environment: string | undefined;
  saltRound: number;
  password: string | undefined;
  testDatabase: string | undefined;
  tokenSecret: string | undefined;
}
export const configuration: ApplicationConfiguration = {
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  testDatabase: process.env.POSTGRES_TEST_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  environment: process.env.ENV,
  saltRound: Number(process.env.SALT_ROUNDS) || 10,
  tokenSecret: process.env.TOKEN_SECRET,
};
let client: Pool;
export const createClient = (): Pool => {
  if (!client) {
    if (configuration.environment === 'dev') {
      client = new Pool({
        host: configuration.host,
        database: configuration.database,
        user: configuration.user,
        password: configuration.password,
      });
    } else if (configuration.environment === 'test') {
      client = new Pool({
        host: configuration.host,
        database: configuration.testDatabase,
        user: configuration.user,
        password: configuration.password,
      });
    } else {
      client = new Pool({
        host: configuration.host,
        database: configuration.database,
        user: configuration.user,
        password: configuration.password,
      });
    }
  }
  return client;
};
