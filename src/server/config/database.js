import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'ajishisingh',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'military_assets',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

export default pool; 