-- Military Asset Management System Database Schema

-- Users and Roles
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(role_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Bases
CREATE TABLE bases (
    base_id SERIAL PRIMARY KEY,
    base_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    commander_id INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Equipment Categories
CREATE TABLE equipment_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Types
CREATE TABLE equipment_types (
    type_id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES equipment_categories(category_id),
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, type_name)
);

-- Assets
CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,
    type_id INTEGER REFERENCES equipment_types(type_id),
    serial_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) NOT NULL, -- Available, Assigned, Expended, Maintenance
    current_base_id INTEGER REFERENCES bases(base_id),
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Balances
CREATE TABLE asset_balances (
    balance_id SERIAL PRIMARY KEY,
    base_id INTEGER REFERENCES bases(base_id),
    type_id INTEGER REFERENCES equipment_types(type_id),
    opening_balance INTEGER NOT NULL DEFAULT 0,
    closing_balance INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(base_id, type_id, date)
);

-- Purchases
CREATE TABLE purchases (
    purchase_id SERIAL PRIMARY KEY,
    base_id INTEGER REFERENCES bases(base_id),
    type_id INTEGER REFERENCES equipment_types(type_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    purchase_date DATE NOT NULL,
    vendor_name VARCHAR(100),
    purchase_order_number VARCHAR(100),
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transfers
CREATE TABLE transfers (
    transfer_id SERIAL PRIMARY KEY,
    source_base_id INTEGER REFERENCES bases(base_id),
    destination_base_id INTEGER REFERENCES bases(base_id),
    type_id INTEGER REFERENCES equipment_types(type_id),
    quantity INTEGER NOT NULL,
    transfer_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- Pending, Completed, Cancelled
    transfer_order_number VARCHAR(100),
    created_by INTEGER REFERENCES users(user_id),
    approved_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Assignments
CREATE TABLE assignments (
    assignment_id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(asset_id),
    assigned_to INTEGER REFERENCES users(user_id),
    assigned_by INTEGER REFERENCES users(user_id),
    base_id INTEGER REFERENCES bases(base_id),
    assignment_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(50) NOT NULL, -- Active, Returned, Lost
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenditures
CREATE TABLE expenditures (
    expenditure_id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(asset_id),
    base_id INTEGER REFERENCES bases(base_id),
    type_id INTEGER REFERENCES equipment_types(type_id),
    quantity INTEGER NOT NULL,
    expenditure_date DATE NOT NULL,
    reason TEXT,
    reported_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
    ('Admin', 'Full access to all system features and data'),
    ('Base Commander', 'Access to data and operations for assigned base'),
    ('Logistics Officer', 'Limited access to purchases and transfers');

-- Create indexes for better query performance
CREATE INDEX idx_assets_type_id ON assets(type_id);
CREATE INDEX idx_assets_current_base_id ON assets(current_base_id);
CREATE INDEX idx_asset_balances_base_type_date ON asset_balances(base_id, type_id, date);
CREATE INDEX idx_purchases_base_date ON purchases(base_id, purchase_date);
CREATE INDEX idx_transfers_source_dest_date ON transfers(source_base_id, destination_base_id, transfer_date);
CREATE INDEX idx_assignments_asset_user ON assignments(asset_id, assigned_to);
CREATE INDEX idx_expenditures_base_date ON expenditures(base_id, expenditure_date);
CREATE INDEX idx_audit_log_user_date ON audit_log(user_id, created_at); 