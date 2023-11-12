// db.js
import { Pool } from "pg";

let conn;

if (!conn) {
  conn = new Pool({
    user: process.env.PGSQL_USER,
    password: 'hiD!@LtNqxST##zEbgV5Vj',
    host: process.env.PGSQL_HOST,
    port: process.env.PGSQL_PORT,
    database: process.env.PGSQL_DATABASE,
  });
}

export default conn ;
