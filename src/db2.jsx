// db.js
import { Pool } from "pg";

let conn2;

if (!conn2) {
  conn2 = new Pool({
    user: process.env.PGSQL_USER2,
    password: process.env.PGSQL_PASSWORD2,
    host: process.env.PGSQL_HOST2,
    port: process.env.PGSQL_PORT,
    database: process.env.PGSQL_DATABASE2,
  });
}

export default conn2 ;
