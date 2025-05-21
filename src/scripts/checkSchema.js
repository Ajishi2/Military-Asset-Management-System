import pool from '../server/config/database.js';

const checkSchema = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Checking database schema...');
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:');
    tables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // For each table, check columns
    for (const table of tables.rows) {
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);
      
      console.log(`\nColumns in ${table.table_name}:`);
      columns.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    client.release();
  }
};

checkSchema()
  .then(() => {
    console.log('Schema check completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Schema check failed:', err);
    process.exit(1);
  });
