CREATE DATABASE IF NOT EXISTS petcare_pos_db;
USE petcare_pos_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','STAFF') DEFAULT 'STAFF',
    status ENUM('ACTIVE','LOCKED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    name VARCHAR(200) NOT NULL,
    image_url VARCHAR(255),
    category_id INT,
    brand VARCHAR(100),
    import_price DECIMAL(12,2) DEFAULT 0,
    selling_price DECIMAL(12,2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'Cái',
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    description TEXT,
    status ENUM('ACTIVE','INACTIVE','OUT_OF_STOCK') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(150),
    address VARCHAR(255),
    loyalty_points INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50),
    breed VARCHAR(100),
    age INT,
    weight DECIMAL(5,2),
    gender ENUM('MALE','FEMALE','UNKNOWN') DEFAULT 'UNKNOWN',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NULL,
    user_id INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('CASH','BANK_TRANSFER','QR_PAYMENT','CARD','MIXED') DEFAULT 'CASH',
    payment_status ENUM('UNPAID','PAID') DEFAULT 'UNPAID',
    order_status ENUM('TEMPORARY','PAID','CANCELLED','REFUNDED') DEFAULT 'TEMPORARY',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    import_price DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    type ENUM('IMPORT','SALE','ADJUSTMENT','RETURN') NOT NULL,
    quantity INT NOT NULL,
    before_quantity INT NOT NULL,
    after_quantity INT NOT NULL,
    note TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE NO ACTION,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method ENUM('CASH','BANK_TRANSFER','QR_PAYMENT','CARD','MIXED') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    received_amount DECIMAL(12,2) DEFAULT 0,
    change_amount DECIMAL(12,2) DEFAULT 0,
    transaction_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS store_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(150) DEFAULT 'PetCare Store',
    logo_url VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(150),
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    bank_owner VARCHAR(100),
    invoice_footer TEXT,
    store_status ENUM('OPEN','PAUSED','OUT_OF_STOCK') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed default data
INSERT INTO store_settings (store_name, address, phone, email, bank_name, bank_account, bank_owner, invoice_footer) 
VALUES (
    'PetCare POS Store', 
    '123 Nguyễn Văn Cừ, Quận 5, TP.HCM', 
    '0909123456', 
    'contact@petcare.vn', 
    'Vietcombank', 
    '1011121314', 
    'PETCARE COMPANY', 
    'Cảm ơn quý khách đã mua sắm tại PetCare!'
) ON DUPLICATE KEY UPDATE store_name='PetCare POS Store';

INSERT INTO categories (name, description) VALUES 
('Thức ăn cho chó', 'Các loại hạt, pate cho chó'),
('Thức ăn cho mèo', 'Các loại hạt, pate, súp thưởng cho mèo'),
('Phụ kiện', 'Vòng cổ, dây dắt, quần áo'),
('Cát vệ sinh', 'Cát đậu nành, cát đất sét'),
('Sữa tắm & Vệ sinh', 'Sữa tắm, xịt khử mùi, dụng cụ cắt móng')
ON DUPLICATE KEY UPDATE description=VALUES(description);
