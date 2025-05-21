import pool from '../server/config/database.js';

// Seed data based on mockData.ts
const seedDatabase = async () => {
  const client = await pool.connect();
  
  // Define today's date for use throughout the function
  const today = new Date();
  
  try {
    await client.query('BEGIN');
    
    console.log('Starting database seeding...');
    
    // Clear existing data (if needed)
    console.log('Clearing existing data...');
    // Comment these out if you want to preserve existing data
    await client.query('DELETE FROM purchases');
    await client.query('DELETE FROM transfers');
    await client.query('DELETE FROM assignments');
    await client.query('DELETE FROM assets');
    await client.query('DELETE FROM equipment_types');
    await client.query('DELETE FROM equipment_categories');
    await client.query('DELETE FROM bases');
    await client.query('DELETE FROM users WHERE role_id > 1'); // Preserve admin users
    
    // Seed equipment categories first
    console.log('Seeding equipment categories...');
    const equipmentCategories = [
      { category_name: 'Combat', description: 'Combat equipment including weapons and armor' },
      { category_name: 'Transport', description: 'Vehicles and transportation equipment' },
      { category_name: 'Electronics', description: 'Electronic and communication equipment' },
      { category_name: 'Support', description: 'Support equipment including medical supplies' },
    ];
    
    for (const category of equipmentCategories) {
      await client.query(
        'INSERT INTO equipment_categories (category_name, description) VALUES ($1, $2) RETURNING category_id',
        [category.category_name, category.description]
      );
    }
    
    // Get category IDs
    const categoryResult = await client.query('SELECT category_id, category_name FROM equipment_categories');
    const categoryMap = {};
    categoryResult.rows.forEach(row => {
      categoryMap[row.category_name] = row.category_id;
    });
    
    console.log('Category IDs:', categoryMap);
    
    // Seed bases
    console.log('Seeding bases...');
    const bases = [
      { base_name: 'Alpha Base', location: 'Northern Region' },
      { base_name: 'Beta Base', location: 'Southern Region' },
      { base_name: 'Charlie Base', location: 'Eastern Region' },
      { base_name: 'Delta Base', location: 'Western Region' },
    ];
    
    for (const base of bases) {
      await client.query(
        'INSERT INTO bases (base_name, location, is_active) VALUES ($1, $2, $3) RETURNING base_id',
        [base.base_name, base.location, true]
      );
    }
    
    // Seed equipment types
    console.log('Seeding equipment types...');
    const equipmentTypes = [
      { type_name: 'Weapon', category_id: categoryMap['Combat'], unit_of_measure: 'Unit', description: 'Various weapons' },
      { type_name: 'Vehicle', category_id: categoryMap['Transport'], unit_of_measure: 'Unit', description: 'Military vehicles' },
      { type_name: 'Communication', category_id: categoryMap['Electronics'], unit_of_measure: 'Unit', description: 'Communication devices' },
      { type_name: 'Medical', category_id: categoryMap['Support'], unit_of_measure: 'Kit', description: 'Medical supplies' },
      { type_name: 'Armor', category_id: categoryMap['Combat'], unit_of_measure: 'Unit', description: 'Protective gear' },
    ];
    
    for (const type of equipmentTypes) {
      await client.query(
        'INSERT INTO equipment_types (type_name, category_id, unit_of_measure, description) VALUES ($1, $2, $3, $4) RETURNING type_id',
        [type.type_name, type.category_id, type.unit_of_measure, type.description]
      );
    }
    
    // Get the inserted base and equipment type IDs
    const baseResult = await client.query('SELECT base_id, base_name FROM bases');
    const typeResult = await client.query('SELECT type_id, type_name FROM equipment_types');
    
    const baseMap = {};
    baseResult.rows.forEach(row => {
      baseMap[row.base_name] = row.base_id;
    });
    
    const typeMap = {};
    typeResult.rows.forEach(row => {
      typeMap[row.type_name] = row.type_id;
    });
    
    console.log('Base IDs:', baseMap);
    console.log('Equipment Type IDs:', typeMap);
    
    // Seed assets
    console.log('Seeding assets...');
    const assets = [
      { type_id: typeMap['Weapon'], serial_number: 'W001', status: 'Available', current_base_id: baseMap['Alpha Base'], purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 60), purchase_price: 1500 },
      { type_id: typeMap['Vehicle'], serial_number: 'V001', status: 'Available', current_base_id: baseMap['Alpha Base'], purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 55), purchase_price: 75000 },
      { type_id: typeMap['Weapon'], serial_number: 'W002', status: 'Available', current_base_id: baseMap['Beta Base'], purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 50), purchase_price: 5000 },
      { type_id: typeMap['Vehicle'], serial_number: 'V002', status: 'Available', current_base_id: baseMap['Beta Base'], purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 45), purchase_price: 120000 },
      { type_id: typeMap['Communication'], serial_number: 'C001', status: 'Available', current_base_id: baseMap['Alpha Base'], purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 40), purchase_price: 800 },
      { type_id: typeMap['Communication'], serial_number: 'C002', status: 'Available', current_base_id: baseMap['Beta Base'], purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 35), purchase_price: 6000 },
    ];
    
    for (const asset of assets) {
      await client.query(
        'INSERT INTO assets (type_id, serial_number, status, current_base_id, purchase_date, purchase_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING asset_id',
        [asset.type_id, asset.serial_number, asset.status, asset.current_base_id, asset.purchase_date, asset.purchase_price]
      );
    }
    
    // Seed users FIRST to ensure we have user IDs for other operations
    console.log('Seeding users...');
    const users = [
      { username: 'admin', password_hash: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9Mb7uTtEzl1Fs2', email: 'admin@military.com', full_name: 'System Administrator', role_id: 1 },
      { username: 'commander', password_hash: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9Mb7uTtEzl1Fs2', email: 'commander@military.com', full_name: 'Base Commander', role_id: 2 },
      { username: 'logistics', password_hash: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9Mb7uTtEzl1Fs2', email: 'logistics@military.com', full_name: 'Logistics Officer', role_id: 3 },
      { username: 'comalpha', password_hash: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9Mb7uTtEzl1Fs2', email: 'comalpha@military.com', full_name: 'Commander Alpha', role_id: 2 },
      { username: 'combeta', password_hash: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9Mb7uTtEzl1Fs2', email: 'combeta@military.com', full_name: 'Commander Beta', role_id: 2 },
      { username: 'loalpha', password_hash: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9Mb7uTtEzl1Fs2', email: 'loalpha@military.com', full_name: 'Logistics Officer Alpha', role_id: 3 },
      { username: 'lobeta', password_hash: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9Mb7uTtEzl1Fs2', email: 'lobeta@military.com', full_name: 'Logistics Officer Beta', role_id: 3 },
    ];
    
    // Store user IDs for later use
    const userIds = {};
    
    for (const user of users) {
      const result = await client.query(
        'INSERT INTO users (username, password_hash, email, full_name, role_id, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id',
        [user.username, user.password_hash, user.email, user.full_name, user.role_id, true]
      );
      userIds[user.username] = result.rows[0].user_id;
    }
    
    console.log('User IDs:', userIds);
    
    // Seed sample purchases
    console.log('Seeding purchases...');
    // Use the admin user ID for created_by
    const adminUserId = userIds['admin'];
    console.log('Using admin user ID for purchases:', adminUserId);
    
    const purchases = [
      { 
        base_id: baseMap['Alpha Base'], 
        type_id: typeMap['Weapon'], 
        quantity: 50, 
        unit_price: 1000, 
        purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30), 
        vendor_name: 'Weapons Supplier Inc.', 
        purchase_order_number: 'PO-001', 
        created_by: adminUserId 
      },
      { 
        base_id: baseMap['Alpha Base'], 
        type_id: typeMap['Vehicle'], 
        quantity: 5, 
        unit_price: 50000, 
        purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 25), 
        vendor_name: 'Military Vehicles Ltd.', 
        purchase_order_number: 'PO-002', 
        created_by: adminUserId 
      },
      { 
        base_id: baseMap['Beta Base'], 
        type_id: typeMap['Weapon'], 
        quantity: 10, 
        unit_price: 3000, 
        purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20), 
        vendor_name: 'Precision Arms Co.', 
        purchase_order_number: 'PO-003', 
        created_by: adminUserId 
      },
      { 
        base_id: baseMap['Beta Base'], 
        type_id: typeMap['Vehicle'], 
        quantity: 3, 
        unit_price: 150000, 
        purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 15), 
        vendor_name: 'Armored Vehicles Inc.', 
        purchase_order_number: 'PO-004', 
        created_by: adminUserId 
      },
      { 
        base_id: baseMap['Alpha Base'], 
        type_id: typeMap['Communication'], 
        quantity: 20, 
        unit_price: 750, 
        purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10), 
        vendor_name: 'Comm Systems Corp.', 
        purchase_order_number: 'PO-005', 
        created_by: adminUserId 
      },
      { 
        base_id: baseMap['Beta Base'], 
        type_id: typeMap['Communication'], 
        quantity: 5, 
        unit_price: 5000, 
        purchase_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5), 
        vendor_name: 'Satellite Comms Ltd.', 
        purchase_order_number: 'PO-006', 
        created_by: adminUserId 
      },
    ];
    
    for (const purchase of purchases) {
      // Calculate total amount
      const totalAmount = purchase.quantity * purchase.unit_price;
      
      await client.query(
        `INSERT INTO purchases 
         (base_id, type_id, quantity, unit_price, total_amount, purchase_date, vendor_name, purchase_order_number, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING purchase_id`,
        [
          purchase.base_id, 
          purchase.type_id, 
          purchase.quantity, 
          purchase.unit_price,
          totalAmount,
          purchase.purchase_date, 
          purchase.vendor_name, 
          purchase.purchase_order_number, 
          purchase.created_by
        ]
      );
    }
    
    await client.query('COMMIT');
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('Seeding completed, exiting...');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
