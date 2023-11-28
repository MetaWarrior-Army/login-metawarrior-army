// db.js
import { Pool } from "pg";

let conn2;

if (!conn2) {
  conn2 = new Pool({
    //user: process.env.PGSQL_USER2,
    user: 'postfix',
    //password: process.env.PGSQL_PASSWORD2,
    password: 'bKjm9HLeVoaSei$',
    //host: process.env.PGSQL_HOST2,
    host: '10.124.0.4',
    port: process.env.PGSQL_PORT,
    //database: process.env.PGSQL_DATABASE2,
  });
}

export default conn2 ;
