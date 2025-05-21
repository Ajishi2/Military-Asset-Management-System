import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Use Render hosted PostgreSQL database
const isProduction = process.env.NODE_ENV === 'production';

// Render database configuration
const renderDbConfig = {
  user: 'military_assets_db_user',
  host: 'dpg-d0m2vnogjchc739g71eg-a.oregon-postgres.render.com',
  database: 'military_assets_db',
  password: 'rCIWyrhSNO9wa1fVSRQvJiss8V0tpnox',
  port: 5432,
  ssl: { rejectUnauthorized: false } // Required for Render PostgreSQL
};

// Local database fallback configuration
const localDbConfig = {
  user: process.env.DB_USER || 'ajishisingh',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'military_assets',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432
};

// Use Render database configuration
const pool = new Pool(renderDbConfig);

console.log('Database configuration:', {
  host: renderDbConfig.host,
  database: renderDbConfig.database,
  user: renderDbConfig.user,
  ssl: renderDbConfig.ssl ? 'enabled' : 'disabled'
});

export default pool; 