import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://military-asset-management.onrender.com'] // Add your frontend URL
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to database');
  release();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // TODO: Add password comparison with bcrypt
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Asset Routes
app.get('/api/assets', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, et.type_name, b.base_name 
      FROM assets a
      JOIN equipment_types et ON a.type_id = et.type_id
      JOIN bases b ON a.current_base_id = b.base_id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Base Routes
app.get('/api/bases', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bases WHERE is_active = true');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bases:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dashboard Routes
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const { base_id, start_date, end_date } = req.query;
    
    const result = await pool.query(`
      SELECT 
        et.type_name,
        COALESCE(ab.opening_balance, 0) as opening_balance,
        COALESCE(ab.closing_balance, 0) as closing_balance,
        COALESCE(p.total_purchases, 0) as total_purchases,
        COALESCE(t_in.total_transfers_in, 0) as total_transfers_in,
        COALESCE(t_out.total_transfers_out, 0) as total_transfers_out
      FROM equipment_types et
      LEFT JOIN asset_balances ab ON et.type_id = ab.type_id 
        AND ab.base_id = $1 
        AND ab.date BETWEEN $2 AND $3
      LEFT JOIN (
        SELECT type_id, SUM(quantity) as total_purchases
        FROM purchases
        WHERE base_id = $1 AND purchase_date BETWEEN $2 AND $3
        GROUP BY type_id
      ) p ON et.type_id = p.type_id
      LEFT JOIN (
        SELECT type_id, SUM(quantity) as total_transfers_in
        FROM transfers
        WHERE destination_base_id = $1 
        AND transfer_date BETWEEN $2 AND $3
        AND status = 'Completed'
        GROUP BY type_id
      ) t_in ON et.type_id = t_in.type_id
      LEFT JOIN (
        SELECT type_id, SUM(quantity) as total_transfers_out
        FROM transfers
        WHERE source_base_id = $1 
        AND transfer_date BETWEEN $2 AND $3
        AND status = 'Completed'
        GROUP BY type_id
      ) t_out ON et.type_id = t_out.type_id
    `, [base_id, start_date, end_date]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 