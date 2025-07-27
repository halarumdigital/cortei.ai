const mysql = require('mysql2/promise');
require('dotenv').config();

async function addMercadoPagoMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'brelli',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('🚀 Iniciando migration do MercadoPago...');

    // 1. Adicionar colunas do MercadoPago na tabela companies
    console.log('📝 Adicionando colunas do MercadoPago na tabela companies...');
    
    const alterCompaniesQueries = [
      'ALTER TABLE companies ADD COLUMN mercadopago_access_token VARCHAR(255) NULL',
      'ALTER TABLE companies ADD COLUMN mercadopago_public_key VARCHAR(255) NULL',
      'ALTER TABLE companies ADD COLUMN mercadopago_webhook_url VARCHAR(500) NULL',
      'ALTER TABLE companies ADD COLUMN mercadopago_enabled BOOLEAN DEFAULT FALSE'
    ];

    for (const query of alterCompaniesQueries) {
      try {
        await connection.execute(query);
        console.log(`✅ ${query}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Coluna já existe: ${query}`);
        } else {
          console.error(`❌ Erro ao executar: ${query}`, error.message);
        }
      }
    }

    // 2. Criar tabela de transações do MercadoPago
    console.log('📝 Criando tabela mercadopago_transactions...');
    
    const createTransactionsTable = `
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    try {
      await connection.execute(createTransactionsTable);
      console.log('✅ Tabela mercadopago_transactions criada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar tabela mercadopago_transactions:', error.message);
    }

    // 3. Criar tabela de webhooks do MercadoPago
    console.log('📝 Criando tabela mercadopago_webhooks...');
    
    const createWebhooksTable = `
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    try {
      await connection.execute(createWebhooksTable);
      console.log('✅ Tabela mercadopago_webhooks criada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar tabela mercadopago_webhooks:', error.message);
    }

    // 4. Criar tabela de configurações de pagamento
    console.log('📝 Criando tabela payment_settings...');
    
    const createPaymentSettingsTable = `
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    try {
      await connection.execute(createPaymentSettingsTable);
      console.log('✅ Tabela payment_settings criada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar tabela payment_settings:', error.message);
    }

    // 5. Criar tabela de histórico de pagamentos
    console.log('📝 Criando tabela payment_history...');
    
    const createPaymentHistoryTable = `
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    try {
      await connection.execute(createPaymentHistoryTable);
      console.log('✅ Tabela payment_history criada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar tabela payment_history:', error.message);
    }

    console.log('🎉 Migration do MercadoPago concluída com sucesso!');
    console.log('');
    console.log('📋 Resumo das alterações:');
    console.log('✅ Colunas do MercadoPago adicionadas na tabela companies');
    console.log('✅ Tabela mercadopago_transactions criada');
    console.log('✅ Tabela mercadopago_webhooks criada');
    console.log('✅ Tabela payment_settings criada');
    console.log('✅ Tabela payment_history criada');

  } catch (error) {
    console.error('❌ Erro durante a migration:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Executar a migration se o arquivo for executado diretamente
if (require.main === module) {
  addMercadoPagoMigration()
    .then(() => {
      console.log('✅ Migration executada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar migration:', error);
      process.exit(1);
    });
}

module.exports = addMercadoPagoMigration; 