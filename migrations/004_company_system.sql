-- Migration: 004_company_system.sql
-- Description: Sistema de empresas e configurações corporativas
-- Date: 2025-06-28

-- ================================================
-- SISTEMA DE EMPRESAS
-- ================================================

CREATE TABLE IF NOT EXISTS companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fantasy_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    cnpj VARCHAR(20),
    cpf VARCHAR(15),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(2),
    postal_code VARCHAR(10),
    plan_id INT,
    status ENUM('active', 'suspended', 'blocked') DEFAULT 'active',
    trial_days INT DEFAULT 7,
    trial_start_date DATE,
    subscription_status ENUM('active', 'trial', 'canceled', 'past_due') DEFAULT 'trial',
    subscription_start_date DATE,
    subscription_end_date DATE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    custom_domain VARCHAR(255),
    custom_html TEXT,
    tour_enabled TINYINT(1) DEFAULT 1,
    tour_color VARCHAR(7) DEFAULT '#a855f7',
    ai_agent_prompt TEXT,
    default_birthday_message TEXT DEFAULT 'Parabéns pelo seu aniversário! 🎉 A equipe da {company_name} deseja um dia repleto de alegrias e realizações!',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_plan (plan_id),
    INDEX idx_status (status),
    INDEX idx_subscription_status (subscription_status),
    FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- ================================================
-- CONFIGURAÇÕES SMTP POR EMPRESA
-- ================================================

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255),
ADD COLUMN IF NOT EXISTS smtp_port INT DEFAULT 587,
ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255),
ADD COLUMN IF NOT EXISTS smtp_password TEXT,
ADD COLUMN IF NOT EXISTS smtp_from_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS smtp_from_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS smtp_secure VARCHAR(10) DEFAULT 'tls';

-- ================================================
-- INSERÇÃO DE DADOS INICIAIS
-- ================================================

-- Empresa de teste
INSERT INTO companies (fantasy_name, company_name, email, password, plan_id) VALUES
('Empresa Teste', 'Empresa Teste LTDA', 'teste@empresa.com', '$2b$12$8H.kWrJ7tFfJrj8xJNqb3.ZGO5wJ8oHzQ3E5wJ5xJqBd.vM4cGQ4W', 1)
ON DUPLICATE KEY UPDATE id=id;

-- Registrar esta migration
INSERT IGNORE INTO migrations (filename) VALUES ('004_company_system.sql');