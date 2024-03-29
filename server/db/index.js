import { createPool } from "mysql2/promise";
import { config } from "dotenv";
config();

export default createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: {
    rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTH || false,
  },
});
