// db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
});

// Optional: test connection
pool.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL");
    client.release();
  })
  .catch(err => console.error("❌ Postgres connection error", err.stack));

export default pool;
