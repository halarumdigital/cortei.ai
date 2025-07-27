# 🔍 Relatório de Validação das Migrations

## ❌ Inconsistências Encontradas

### 1. **Tabelas Faltando nas Migrations**

As seguintes tabelas estão definidas no schema mas não têm migrations correspondentes:

#### 📋 Sistema de Suporte
- `support_ticket_types` - Tipos de tickets de suporte
- `support_ticket_statuses` - Status dos tickets
- `support_tickets` - Tickets de suporte

#### 🎯 Sistema de Tour Guiado
- `tour_steps` - Passos do tour guiado
- `company_tour_progress` - Progresso do tour por empresa

#### 💰 Sistema Financeiro
- `financial_categories` - Categorias financeiras
- `payment_methods` - Métodos de pagamento
- `financial_transactions` - Transações financeiras

#### 🏷️ Sistema de Produtos/Inventário
- `products` - Produtos/inventário

### 2. **Colunas Faltando nas Migrations**

#### Tabela `companies`:
- `company_name` - Nome da empresa (diferente de fantasy_name)
- `cnpj` - CNPJ da empresa
- `cpf` - CPF (para MEI)
- `whatsapp` - WhatsApp da empresa
- `postal_code` - CEP
- `subscription_start_date` - Data início assinatura
- `subscription_end_date` - Data fim assinatura
- `ai_agent_prompt` - Prompt do agente IA
- `reset_token` - Token de reset de senha
- `reset_token_expires` - Expiração do token

#### Tabela `admins`:
- `username` - Nome de usuário
- `firstName` - Primeiro nome
- `lastName` - Último nome

#### Tabela `global_settings`:
- `system_name` - Nome do sistema
- `secondary_color` - Cor secundária
- `background_color` - Cor de fundo
- `text_color` - Cor do texto
- `evolution_api_global_key` - Chave global Evolution API

#### Tabela `plans`:
- `stripe_annual_price_id` - ID do preço anual no Stripe

### 3. **Diferenças de Estrutura**

#### Tabela `sessions`:
- **Migration**: Usa `session_id`, `expires`, `data`
- **Schema**: Usa `sid`, `sess`, `expire`
- ❌ **Inconsistência**: Nomes de colunas diferentes

#### Tabela `companies`:
- **Migration**: `document` (genérico)
- **Schema**: `cnpj` e `cpf` (específicos)
- ❌ **Inconsistência**: Estrutura de documento diferente

### 4. **Migrations Incompletas**

#### Migration 003 (Plans System):
- Tabela `products` definida mas incompleta
- Tabela `coupons` definida mas incompleta

#### Migration 004 (Company System):
- Seção "CONFIGURAÇÕES SMTP POR EMPRESA" vazia
- Faltam colunas importantes da tabela companies

#### Migration 005 (Appointment System):
- Seção "SISTEMA DE CLIENTES" vazia
- Faltam definições de tabelas importantes

#### Migration 006 (Communication System):
- Seção "HISTÓRICO DE MENSAGENS" vazia
- Falta tabela `messages` completa

#### Migration 007 (Additional Systems):
- Várias seções incompletas
- Faltam tabelas de suporte e tour

## ✅ Recomendações para Correção

### 1. **Criar Migrations Faltantes**
```sql
-- 009_support_system.sql
-- 010_tour_system.sql  
-- 011_financial_system.sql
-- 012_inventory_system.sql
```

### 2. **Completar Migrations Existentes**
- Finalizar seções vazias nas migrations 003-007
- Adicionar colunas faltantes

### 3. **Corrigir Inconsistências**
- Padronizar nomes de colunas da tabela `sessions`
- Definir estrutura única para documentos (CNPJ/CPF)

### 4. **Validar Schema**
- Executar migrations em ambiente de teste
- Comparar resultado com schema atual
- Ajustar diferenças encontradas

## 🚨 Impacto

### Alto Risco:
- Tabela `sessions` com estrutura diferente pode quebrar autenticação
- Falta de migrations para tabelas críticas

### Médio Risco:
- Colunas faltantes podem causar erros em funcionalidades específicas
- Inconsistências de nomenclatura

### Baixo Risco:
- Tabelas de funcionalidades opcionais (tour, suporte)

## 📋 Próximos Passos

1. **Prioridade Alta**: Corrigir tabela `sessions`
2. **Prioridade Alta**: Completar migrations 003-007
3. **Prioridade Média**: Criar migrations 009-012
4. **Prioridade Baixa**: Padronizar nomenclaturas

---
*Relatório gerado em: $(date)*