DROP DATABASE IF EXISTS beauty_salon_management;
CREATE DATABASE beauty_salon_management;
USE beauty_salon_management;

CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    type ENUM('super_admin', 'manager') NOT NULL DEFAULT 'manager',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    email VARCHAR(120) NOT NULL UNIQUE,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    file VARCHAR(255) DEFAULT NULL,
    about TEXT,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    email VARCHAR(120) NOT NULL UNIQUE,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_parlour TINYINT(1) NOT NULL DEFAULT 0
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    created_by INT NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    CONSTRAINT fk_categories_admin
        FOREIGN KEY (created_by) REFERENCES admin(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    service_type INT NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    address VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    file VARCHAR(255) DEFAULT NULL,
    detail TEXT,
    CONSTRAINT fk_services_category
        FOREIGN KEY (service_type) REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_services_user
        FOREIGN KEY (created_by) REFERENCES user(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE appointment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service VARCHAR(255) NOT NULL,
    appt_date DATE NOT NULL,
    appt_time TIME NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    address VARCHAR(255) NOT NULL,
    detail TEXT,
    parlour INT NOT NULL,
    created_by INT NULL,
    status ENUM('booked', 'completed', 'cancelled') NOT NULL DEFAULT 'booked',
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointment_parlour
        FOREIGN KEY (parlour) REFERENCES user(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_appointment_user
        FOREIGN KEY (created_by) REFERENCES user(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE appointment_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    service_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_appointment_items_appointment
        FOREIGN KEY (appointment_id) REFERENCES appointment(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_appointment_items_service
        FOREIGN KEY (service_id) REFERENCES services(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_title VARCHAR(150) NOT NULL,
    meta_title VARCHAR(150) NOT NULL,
    meta_tags VARCHAR(255) DEFAULT NULL,
    meta_desc TEXT,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logo VARCHAR(255) DEFAULT NULL
);

INSERT INTO admin (name, password, type, status, email, date) VALUES
('Aisha Khan', 'admin123', 'super_admin', 'active', 'admin@beautyhub.com', '2026-03-20 10:00:00'),
('Nina Roy', 'manager123', 'manager', 'active', 'manager@beautyhub.com', '2026-03-21 11:00:00');

INSERT INTO user (name, mobile, password, file, about, status, email, date, is_parlour) VALUES
('Glow Studio', '9876500001', 'parlour123', 'https://placehold.co/120x120?text=Glow', 'Premium salon for bridal and skin treatments.', 'active', 'glow@beautyhub.com', '2026-03-21 09:15:00', 1),
('Blush Bar', '9876500002', 'parlour123', 'https://placehold.co/120x120?text=Blush', 'Modern parlour focused on hair styling and grooming.', 'active', 'blush@beautyhub.com', '2026-03-21 09:30:00', 1),
('Ritika Sharma', '9876500011', 'user123', 'https://placehold.co/120x120?text=Ritika', 'Regular customer who books weekend salon sessions.', 'active', 'ritika@gmail.com', '2026-03-22 14:00:00', 0),
('Meera Jain', '9876500012', 'user123', 'https://placehold.co/120x120?text=Meera', 'Customer interested in facials and hair spa services.', 'active', 'meera@gmail.com', '2026-03-23 16:30:00', 0);

INSERT INTO categories (title, created_by, date, status) VALUES
('Hair Care', 1, '2026-03-22 10:00:00', 'active'),
('Skin Care', 1, '2026-03-22 10:15:00', 'active'),
('Bridal', 2, '2026-03-22 10:30:00', 'active');

INSERT INTO services (title, service_type, mobile, address, price, status, date, created_by, file, detail) VALUES
('Hair Spa', 1, '9876500001', '12 Lake Road, Kolkata', 799.00, 'active', '2026-03-23 12:00:00', 1, 'https://placehold.co/300x200?text=Hair+Spa', 'Nourishing hair spa with wash, massage, and conditioning.'),
('Keratin Smoothening', 1, '9876500002', '44 Park Street, Kolkata', 2499.00, 'active', '2026-03-23 12:30:00', 2, 'https://placehold.co/300x200?text=Keratin', 'Professional smoothening treatment for frizz control.'),
('Fruit Facial', 2, '9876500001', '12 Lake Road, Kolkata', 999.00, 'active', '2026-03-23 13:00:00', 1, 'https://placehold.co/300x200?text=Facial', 'Refreshing fruit facial for radiant and hydrated skin.'),
('Bridal Makeup Package', 3, '9876500002', '44 Park Street, Kolkata', 8999.00, 'active', '2026-03-23 13:30:00', 2, 'https://placehold.co/300x200?text=Bridal', 'Full bridal makeup with hairstyling and draping support.');

INSERT INTO appointment (service, appt_date, appt_time, name, email, mobile, address, detail, parlour, created_by, status, date) VALUES
('Hair Spa, Fruit Facial', '2026-03-30', '11:00:00', 'Ritika Sharma', 'ritika@gmail.com', '9876500011', 'Salt Lake, Kolkata', 'Weekend self-care appointment.', 1, 3, 'booked', '2026-03-25 18:00:00'),
('Bridal Makeup Package', '2026-04-02', '09:00:00', 'Meera Jain', 'meera@gmail.com', '9876500012', 'Ballygunge, Kolkata', 'Trial bridal look before event.', 2, 4, 'completed', '2026-03-26 15:45:00');

INSERT INTO appointment_items (appointment_id, service_id, price) VALUES
(1, 1, 799.00),
(1, 3, 999.00),
(2, 4, 8999.00);

INSERT INTO settings (site_title, meta_title, meta_tags, meta_desc, date, logo) VALUES
('Beauty and Salon Management System', 'BeautyHub Salon Dashboard', 'beauty, salon, booking, bridal, spa', 'Academic database project for salon booking, billing, and management.', '2026-03-24 09:00:00', 'https://placehold.co/200x80?text=BeautyHub');
