-- Idyll Productions Database Schema
-- PostgreSQL Database Setup

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    role VARCHAR(50) DEFAULT 'editor' CHECK (role IN ('editor', 'moderator', 'owner')),
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table (for editor applications)
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    location VARCHAR(255),
    software VARCHAR(255),
    role VARCHAR(255),
    portfolio TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    task_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255) NOT NULL,
    deadline DATE NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    raw_file TEXT,
    edited_file TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings table
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    attendees TEXT[], -- PostgreSQL array for attendees
    organizer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payouts table
CREATE TABLE payouts (
    id SERIAL PRIMARY KEY,
    editor VARCHAR(255) NOT NULL,
    project VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    edited_link TEXT NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    sender VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) DEFAULT 'user' CHECK (type IN ('user', 'system'))
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    urgent BOOLEAN DEFAULT false,
    time VARCHAR(50) DEFAULT 'Just now',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Insert default admin user (update with your actual email)
INSERT INTO users (uid, email, display_name, role, approved) 
VALUES ('admin-001', 'idyllproductionsofficial@gmail.com', 'Idyll Productions', 'owner', true);

INSERT INTO users (uid, email, display_name, role, approved) 
VALUES ('mod-001', 'harshpawar7711@gmail.com', 'Harsh Pawar', 'moderator', true);

INSERT INTO users (uid, email, display_name, role, approved) 
VALUES ('mod-002', 'rohitidyllproductions@gmail.com', 'Rohit', 'moderator', true);