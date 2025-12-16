-- Migration to create users table and migrate existing users
-- Execute this on Railway PostgreSQL

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR NOT NULL,
    role VARCHAR NOT NULL DEFAULT 'agent',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url VARCHAR,
    phone VARCHAR,
    agent_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Seed initial admin users
-- NOTE: These are hashed passwords using bcrypt
-- tvindima@imoveismais.pt -> password: testepassword123 -> hash generated with bcrypt
-- faturacao@imoveismais.pt -> password: 123456 -> hash generated with bcrypt
-- leiria@imoveismais.pt -> password: 123456 -> hash generated with bcrypt

INSERT INTO users (email, hashed_password, full_name, role, is_active)
VALUES 
    ('tvindima@imoveismais.pt', '$2b$12$swVTTteevKl36Eu1hDEyCeOSiVmFtCHCxUgmJEnfrltjajjB/hT8m', 'Tiago Vindima', 'admin', true),
    ('faturacao@imoveismais.pt', '$2b$12$tJ9SyJAyLrKifBTojKQqNeaoFjyISDAmN7L71EncBfWAcJyYoUpk6', 'Gestor de Loja', 'admin', true),
    ('leiria@imoveismais.pt', '$2b$12$tJ9SyJAyLrKifBTojKQqNeaoFjyISDAmN7L71EncBfWAcJyYoUpk6', 'Admin Leiria', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
