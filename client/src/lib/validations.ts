import { z } from "zod";

export function formatDocument(value: string): string {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // If length is 11, format as CPF: 000.000.000-00
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }
  
  // If length is 14, format as CNPJ: 00.000.000/0000-00
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d)/, '$1-$2');
}

// Validation schemas
export const companyProfileSchema = z.object({
  fantasyName: z.string().min(2, "Nome fantasia deve ter pelo menos 2 caracteres"),
  document: z.string().min(11, "CNPJ/CPF é obrigatório"),
  email: z.string().email("E-mail inválido"),
  address: z.string().min(5, "Endereço é obrigatório"),
  phone: z.string().optional(),
  zipCode: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  planId: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
  tourEnabled: z.boolean().optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
});

export const companyPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export const companyAiAgentSchema = z.object({
  aiAgentPrompt: z.string().min(10, "Prompt deve ter pelo menos 10 caracteres"),
});

export const whatsappInstanceSchema = z.object({
  instanceName: z.string().min(3, "Nome da instância deve ter pelo menos 3 caracteres"),
  phoneNumber: z.string().min(10, "Número de telefone é obrigatório (com DDD)"),
});

export const webhookConfigSchema = z.object({
  apiUrl: z.string().url("URL da API inválida"),
  apiKey: z.string().min(10, "Chave da API é obrigatória"),
});

export const companySchema = z.object({
  fantasyName: z.string().min(2, "Nome fantasia deve ter pelo menos 2 caracteres"),
  document: z.string().min(11, "CNPJ/CPF é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  address: z.string().min(5, "Endereço é obrigatório"),
  phone: z.string().min(1, "Celular é obrigatório"),
  zipCode: z.string().min(1, "CEP é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  planId: z.number().min(1, "Plano é obrigatório"),
  isActive: z.boolean().default(true),
  tourEnabled: z.boolean().default(true),
});

export const planSchema = z.object({
  name: z.string().min(2, "Nome do plano deve ter pelo menos 2 caracteres"),
  freeDays: z.number().min(0, "Dias grátis deve ser maior ou igual a 0"),
  price: z.string().min(1, "Preço é obrigatório"),
  annualPrice: z.string().optional(),
  maxProfessionals: z.number().min(1, "Máximo de profissionais deve ser pelo menos 1"),
  isActive: z.boolean().default(true),
  permissions: z.record(z.boolean()).default({}),
});

export const companySettingsSchema = z.object({
  birthdayMessage: z.string().optional(),
  aiAgentPrompt: z.string().optional(),
});

export const settingsSchema = z.object({
  systemName: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  primaryColor: z.string().min(4, "Cor primária é obrigatória"),
  secondaryColor: z.string().min(4, "Cor secundária é obrigatória"),
  backgroundColor: z.string().min(4, "Cor de fundo é obrigatória"),
  textColor: z.string().min(4, "Cor do texto é obrigatória"),
  tourColor: z.string().min(4, "Cor do tour guiado é obrigatória"),
  evolutionApiUrl: z.string().optional(),
  evolutionApiGlobalKey: z.string().optional(),
  defaultBirthdayMessage: z.string().optional(),
  openaiApiKey: z.string().optional(),
  openaiModel: z.string().optional(),
  openaiTemperature: z.string().optional(),
  openaiMaxTokens: z.string().optional(),
  defaultAiPrompt: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpFromEmail: z.string().optional(),
  smtpFromName: z.string().optional(),
  smtpSecure: z.string().optional(),
  customHtml: z.string().optional(),
  customDomainUrl: z.string().optional(),
  systemUrl: z.string().optional(),
});