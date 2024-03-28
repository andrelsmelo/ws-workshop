import pkg from 'pg';

const { Pool } = pkg;

const dbConfig = {
  user: 'db_user',
  password: 'db_password',
  database: 'db_name',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(dbConfig);

export default pool;
