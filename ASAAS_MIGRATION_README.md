# Migration Asaas - Documentação

## 📋 Arquivos Criados

### 1. Migration SQL
**Arquivo:** `migrations/021_consolidate_asaas_fields.sql`

Esta migration garante que todos os campos necessários para a integração com Asaas existam nas tabelas:

#### Tabela `companies` - 6 campos:
- `asaas_api_key` - Chave API do Asaas (opcional, pode usar chave global)
- `asaas_webhook_url` - URL do webhook para esta empresa
- `asaas_environment` - Ambiente: 'sandbox' ou 'production' (padrão: 'sandbox')
- `asaas_enabled` - Se a integração está habilitada (padrão: false)
- `asaas_customer_id` - ID do cliente no Asaas (para assinatura da plataforma)
- `asaas_subscription_id` - ID da assinatura no Asaas (para assinatura da plataforma)

#### Tabela `appointments` - 2 campos:
- `asaas_payment_id` - ID do pagamento/cobrança no Asaas
- `asaas_payment_status` - Status do pagamento (PENDING, CONFIRMED, RECEIVED, etc.)

### 2. Script de Execução
**Arquivo:** `run-asaas-migration.cjs`

Script automatizado para executar a migration.

## 🚀 Como Executar a Migration

### Opção 1: Via MySQL Client (Recomendado)

```bash
# Conectar ao banco
mysql -h 31.97.91.252 -u corteiia_dev -p corteiia_dev

# Cole a senha quando solicitado: J6HeiNAh04zb

# Executar a migration
source migrations/021_consolidate_asaas_fields.sql;

# Verificar os campos criados
SHOW COLUMNS FROM companies WHERE Field LIKE '%asaas%';
SHOW COLUMNS FROM appointments WHERE Field LIKE '%asaas%';
```

### Opção 2: Via Script Node.js

```bash
node run-asaas-migration.cjs
```

### Opção 3: Copiar e Colar SQL

Abra o arquivo `migrations/021_consolidate_asaas_fields.sql` e execute todo o conteúdo no seu cliente MySQL favorito (phpMyAdmin, MySQL Workbench, etc.).

## ✅ Verificação

Após executar a migration, verifique se os campos foram criados:

```sql
-- Verificar campos na tabela companies
SHOW COLUMNS FROM companies WHERE Field LIKE '%asaas%';
-- Deve retornar 6 linhas

-- Verificar campos na tabela appointments
SHOW COLUMNS FROM appointments WHERE Field LIKE '%asaas%';
-- Deve retornar 2 linhas

-- Verificar índices criados
SHOW INDEX FROM companies WHERE Key_name LIKE '%asaas%';
SHOW INDEX FROM appointments WHERE Key_name LIKE '%asaas%';

-- Verificar dados existentes
SELECT
  COUNT(*) as total_empresas,
  SUM(CASE WHEN asaas_enabled = 1 THEN 1 ELSE 0 END) as com_asaas_habilitado,
  SUM(CASE WHEN asaas_customer_id IS NOT NULL THEN 1 ELSE 0 END) as com_customer_id,
  SUM(CASE WHEN asaas_subscription_id IS NOT NULL THEN 1 ELSE 0 END) as com_subscription_id
FROM companies;
```

## 📊 Campos Criados - Detalhes

### Companies Table

| Campo | Tipo | Descrição | Uso |
|-------|------|-----------|-----|
| `asaas_api_key` | VARCHAR(255) | API Key do Asaas | Permite cada empresa ter sua própria chave |
| `asaas_webhook_url` | VARCHAR(500) | URL do webhook | Para receber notificações de pagamentos |
| `asaas_environment` | VARCHAR(20) | Ambiente | 'sandbox' para testes, 'production' para produção |
| `asaas_enabled` | BOOLEAN | Habilitado | Se a integração está ativa |
| `asaas_customer_id` | VARCHAR(100) | ID Cliente | ID da empresa como cliente no Asaas |
| `asaas_subscription_id` | VARCHAR(100) | ID Assinatura | ID da assinatura recorrente da plataforma |

### Appointments Table

| Campo | Tipo | Descrição | Uso |
|-------|------|-----------|-----|
| `asaas_payment_id` | VARCHAR(255) | ID Pagamento | ID da cobrança criada no Asaas |
| `asaas_payment_status` | VARCHAR(50) | Status | PENDING, CONFIRMED, RECEIVED, OVERDUE, REFUNDED |

## 🔍 Índices Criados

Para melhorar a performance das consultas:

- `idx_companies_asaas_enabled` - Filtra empresas com Asaas habilitado
- `idx_companies_asaas_customer_id` - Busca por customer ID
- `idx_companies_asaas_subscription_id` - Busca por subscription ID
- `idx_appointments_asaas_payment_id` - Busca por payment ID
- `idx_appointments_asaas_payment_status` - Filtra por status de pagamento

## ⚠️ Notas Importantes

1. **Segurança**: A migration usa `IF NOT EXISTS`, então é seguro executá-la múltiplas vezes
2. **Índices**: Se já existirem, serão recriados
3. **Dados**: Nenhum dado existente será alterado ou perdido
4. **Compatibilidade**: Funciona com MySQL 5.7+ e MariaDB 10.2+

## 🎯 Funcionalidades Habilitadas

Após executar esta migration, você poderá:

### 1. Gerenciar Assinaturas das Empresas
- Criar assinaturas recorrentes no Asaas
- Acompanhar status de pagamentos
- Bloquear acesso quando assinatura cancelada
- Redirecionar para renovação automática

### 2. Cobranças por Agendamento
- Gerar cobranças via PIX, Boleto ou Cartão
- Rastrear status de cada pagamento
- Enviar lembretes automáticos

### 3. Webhook Integration
- Receber notificações em tempo real
- Atualizar status automaticamente
- Processar estornos e cancelamentos

## 📞 Suporte

Se encontrar problemas:
1. Verifique se está conectado ao banco correto
2. Confirme que tem permissões de ALTER TABLE
3. Revise os logs de erro do MySQL

## ✅ Próximos Passos

Após executar a migration:
1. ✅ Configure `ASAAS_API_KEY` no .env
2. ✅ Configure `ASAAS_ENVIRONMENT` (sandbox/production)
3. ✅ Teste criar uma assinatura em `/administrador/assinaturas`
4. ✅ Teste o bloqueio de empresas com status 'cancelled'
