// db.js
import pg from "pg";
import dotenv from "dotenv";

// dotenv.config({path: '../.env'});

// Or use this if any error happened
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.NODE_ENV === "production"
      ? process.env.SUPABASE_URL   // full Postgres connection string
      : process.env.LOCAL_DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Optional: test connection
pool.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL");
    client.release();
  })
  .catch(err => console.error("❌ Postgres connection error", err.stack));

export default pool;

