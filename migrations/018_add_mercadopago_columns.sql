-- Migration: Adicionar colunas do MercadoPago na tabela companies
-- Data: 2025-07-27

-- Adicionar colunas do MercadoPago na tabela companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS mercadopago_access_token VARCHAR(255) NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS mercadopago_public_key VARCHAR(255) NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS mercadopago_webhook_url VARCHAR(500) NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS mercadopago_enabled BOOLEAN DEFAULT FALSE;

-- Criar tabela de transações do MercadoPago
CREATE TABLE IF NOT EXISTS mercadopago_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  transaction_id VARCHAR(255) NOT NULL,
  external_reference VARCHAR(255) NULL,
  status VARCHAR(50) NOT NULL,
  payment_method_id VARCHAR(100) NULL,
  payment_type_id VARCHAR(100) NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  description TEXT NULL,
  payer_email VARCHAR(255) NULL,
  payer_name VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company_id (company_id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_external_reference (external_reference),
  INDEX idx_status (status),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de webhooks do MercadoPago
CREATE TABLE IF NOT EXISTS mercadopago_webhooks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  webhook_id VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  events JSON NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company_id (company_id),
  INDEX idx_webhook_id (webhook_id),
  INDEX idx_is_active (is_active),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de configurações de pagamento
CREATE TABLE IF NOT EXISTS payment_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  payment_provider ENUM('stripe', 'mercadopago', 'pix') NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  api_key VARCHAR(255) NULL,
  public_key VARCHAR(255) NULL,
  webhook_url VARCHAR(500) NULL,
  webhook_secret VARCHAR(255) NULL,
  settings JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_provider (company_id, payment_provider),
  INDEX idx_company_id (company_id),
  INDEX idx_payment_provider (payment_provider),
  INDEX idx_is_enabled (is_enabled),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de histórico de pagamentos
CREATE TABLE IF NOT EXISTS payment_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  payment_provider ENUM('stripe', 'mercadopago', 'pix') NOT NULL,
  transaction_id VARCHAR(255) NOT NULL,
  external_reference VARCHAR(255) NULL,
  status VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  description TEXT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company_id (company_id),
  INDEX idx_payment_provider (payment_provider),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_external_reference (external_reference),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 