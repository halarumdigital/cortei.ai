# 📋 Documentação Completa do Sistema

## 🏗️ Visão Geral da Arquitetura

Este é um sistema completo de gerenciamento empresarial desenvolvido em **TypeScript** com arquitetura full-stack moderna, utilizando:

### 🛠️ Stack Tecnológica

**Frontend:**
- **React 18** com TypeScript
- **Vite** como bundler e dev server
- **Tailwind CSS** para estilização
- **Radix UI** para componentes acessíveis
- **React Hook Form** para gerenciamento de formulários
- **React Query** para gerenciamento de estado servidor
- **Framer Motion** para animações
- **Recharts** para gráficos e dashboards

**Backend:**
- **Node.js** com Express.js
- **TypeScript** para tipagem estática
- **Drizzle ORM** para gerenciamento de banco de dados
- **PostgreSQL/MySQL** como banco de dados principal
- **Stripe** para processamento de pagamentos
- **SendGrid** para envio de emails
- **Passport.js** para autenticação

**Infraestrutura:**
- **Session-based authentication** com express-session
- **File upload** com Multer
- **CORS** configurado para desenvolvimento
- **Environment variables** para configuração

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários e configurações
│   └── public/            # Assets estáticos
├── server/                # Backend Express
│   ├── services/          # Serviços de negócio
│   ├── routes.ts          # Definição de rotas
│   ├── db.ts             # Configuração do banco
│   └── index.ts          # Servidor principal
├── shared/               # Código compartilhado
│   └── schema.ts         # Schemas do banco de dados
├── migrations/           # Migrações do banco
├── uploads/             # Arquivos enviados pelos usuários
└── dist/               # Build de produção

```

## 🗄️ Arquitetura do Banco de Dados

### Tabelas Principais

#### 👤 Sistema de Usuários
- **admins** - Administradores do sistema
- **companies** - Empresas cadastradas
- **professionals** - Profissionais das empresas
- **clients** - Clientes das empresas

#### 💰 Sistema de Pagamentos
- **plans** - Planos de assinatura disponíveis
- **subscriptions** - Assinaturas ativas das empresas
- **coupons** - Cupons de desconto
- **affiliate_commissions** - Comissões de afiliados

#### 📅 Sistema de Agendamentos
- **appointments** - Agendamentos de serviços
- **services** - Serviços oferecidos
- **availability** - Disponibilidade dos profissionais

#### 💬 Sistema de Comunicação
- **conversations** - Conversas entre usuários
- **messages** - Mensagens das conversas
- **whatsapp_messages** - Integração WhatsApp
- **email_campaigns** - Campanhas de email

#### ⭐ Sistema de Avaliações
- **reviews** - Avaliações dos clientes
- **review_invitations** - Convites para avaliação
- **loyalty_points** - Sistema de pontos de fidelidade

#### 🎯 Sistema de Tarefas e Lembretes
- **tasks** - Tarefas dos usuários
- **reminders** - Lembretes automáticos
- **notifications** - Notificações do sistema

#### 🎨 Personalização
- **tour_steps** - Passos do tour guiado
- **global_settings** - Configurações globais
- **company_settings** - Configurações por empresa

## 🔐 Sistema de Autenticação

### Tipos de Usuários

1. **Super Admin** - Acesso total ao sistema
2. **Admin** - Gerenciamento de empresas e planos
3. **Company Owner** - Proprietário da empresa
4. **Professional** - Profissional da empresa
5. **Client** - Cliente final

### Fluxo de Autenticação

```typescript
// Middleware de autenticação
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
};

// Verificação de permissões
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};
```

## 🚀 Funcionalidades Principais

### 📊 Dashboard Administrativo
- Estatísticas em tempo real
- Gráficos de receita e crescimento
- Métricas de usuários ativos
- Relatórios personalizáveis

### 🏢 Gestão de Empresas
- Cadastro com validação CNPJ/CPF
- Upload de logos e documentos
- Configurações personalizadas
- Domínios customizados
- Integração SMTP personalizada

### 💳 Sistema de Assinaturas
- Múltiplos planos de assinatura
- Integração com Stripe
- Período de teste gratuito
- Cupons de desconto
- Sistema de afiliados

### 📱 Agendamento Online
- Calendário interativo
- Notificações automáticas
- Integração WhatsApp
- Lembretes por email/SMS

### ⭐ Sistema de Avaliações
- Coleta automática de feedback
- Convites por email
- Análise de sentimentos
- Relatórios de satisfação

### 🎯 CRM Integrado
- Gestão de clientes
- Histórico de interações
- Campanhas de marketing
- Automação de follow-up

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL ou MySQL
- Conta Stripe (para pagamentos)
- Conta SendGrid (para emails)

### Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Autenticação
SESSION_SECRET=sua_chave_secreta_super_segura

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG.xxx

# OpenAI (opcional)
OPENAI_API_KEY=sk-...

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

### Instalação

```bash
# 1. Clone o repositório
git clone <repository-url>
cd sistema-empresarial

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 4. Execute as migrações
npm run db:push

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

## 📡 API Endpoints

### Autenticação
```
POST /api/auth/login          # Login de usuário
POST /api/auth/logout         # Logout
GET  /api/auth/me            # Dados do usuário atual
POST /api/auth/register      # Registro de nova empresa
```

### Empresas
```
GET    /api/companies        # Listar empresas
POST   /api/companies        # Criar empresa
PUT    /api/companies/:id    # Atualizar empresa
DELETE /api/companies/:id    # Deletar empresa
```

### Planos
```
GET    /api/plans           # Listar planos
POST   /api/plans           # Criar plano
PUT    /api/plans/:id       # Atualizar plano
DELETE /api/plans/:id       # Deletar plano
```

### Agendamentos
```
GET    /api/appointments     # Listar agendamentos
POST   /api/appointments     # Criar agendamento
PUT    /api/appointments/:id # Atualizar agendamento
DELETE /api/appointments/:id # Cancelar agendamento
```

### Clientes
```
GET    /api/clients         # Listar clientes
POST   /api/clients         # Criar cliente
PUT    /api/clients/:id     # Atualizar cliente
DELETE /api/clients/:id     # Deletar cliente
```

## 🎨 Interface do Usuário

### Design System
- **Cores**: Paleta moderna com suporte a tema escuro
- **Tipografia**: Inter como fonte principal
- **Componentes**: Baseados em Radix UI para acessibilidade
- **Responsividade**: Mobile-first design
- **Animações**: Micro-interações com Framer Motion

### Páginas Principais

#### Dashboard
- Visão geral das métricas
- Gráficos interativos
- Ações rápidas
- Notificações importantes

#### Gestão de Empresas
- Lista paginada com filtros
- Formulário de cadastro/edição
- Upload de arquivos
- Configurações avançadas

#### Agendamentos
- Calendário visual
- Lista de agendamentos
- Formulário de novo agendamento
- Integração com notificações

#### Relatórios
- Dashboards personalizáveis
- Exportação em PDF/Excel
- Filtros avançados
- Gráficos interativos

## 🔄 Integrações

### Stripe (Pagamentos)
- Processamento de cartões
- Assinaturas recorrentes
- Webhooks para sincronização
- Gestão de cupons

### SendGrid (Emails)
- Templates personalizados
- Campanhas automatizadas
- Tracking de abertura/clique
- Lista de contatos

### WhatsApp Business API
- Envio de mensagens
- Templates aprovados
- Webhooks para respostas
- Integração com CRM

### OpenAI (IA)
- Geração de conteúdo
- Análise de sentimentos
- Chatbot inteligente
- Sugestões automáticas

## 📊 Monitoramento e Analytics

### Métricas Coletadas
- Usuários ativos
- Taxa de conversão
- Receita recorrente (MRR)
- Churn rate
- Satisfação do cliente (NPS)

### Logs e Debugging
- Logs estruturados
- Rastreamento de erros
- Performance monitoring
- Alertas automáticos

## 🚀 Deploy e Produção

### Build de Produção
```bash
# Build do frontend e backend
npm run build

# Iniciar em produção
npm start
```

### Configurações de Produção
- HTTPS obrigatório
- Rate limiting
- Compressão gzip
- Cache de assets
- Backup automático do banco

### Monitoramento
- Health checks
- Métricas de performance
- Alertas de erro
- Backup automático

## 🔒 Segurança

### Medidas Implementadas
- Autenticação baseada em sessão
- Validação de entrada rigorosa
- Sanitização de dados
- Rate limiting
- CORS configurado
- Headers de segurança
- Criptografia de senhas com bcrypt
- Validação de CNPJ/CPF

### Boas Práticas
- Princípio do menor privilégio
- Auditoria de ações
- Backup regular
- Atualizações de segurança
- Monitoramento de vulnerabilidades

## 📚 Documentação Adicional

### Para Desenvolvedores
- Guia de contribuição
- Padrões de código
- Testes automatizados
- CI/CD pipeline

### Para Usuários
- Manual do usuário
- Tutoriais em vídeo
- FAQ
- Suporte técnico

## 🤝 Suporte e Manutenção

### Canais de Suporte
- Sistema de tickets integrado
- Chat ao vivo
- Email de suporte
- Base de conhecimento

### Atualizações
- Versionamento semântico
- Changelog detalhado
- Migrações automáticas
- Rollback seguro

---

*Esta documentação é mantida atualizada com cada release do sistema. Para dúvidas específicas, consulte o código-fonte ou entre em contato com a equipe de desenvolvimento.*