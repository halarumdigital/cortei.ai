import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, Building2, Lock, MessageSquare, Bell, Bot, Smartphone, Plus, Trash2, QrCode } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useCompanyAuth } from "@/hooks/useCompanyAuth";
import { z } from "zod";

// Schemas simplificados
const companyProfileSchema = z.object({
  fantasyName: z.string().min(2, "Nome fantasia deve ter pelo menos 2 caracteres"),
  document: z.string().min(11, "CNPJ/CPF é obrigatório"),
  email: z.string().email("E-mail inválido"),
  address: z.string().min(5, "Endereço é obrigatório"),
});

const companyPasswordSchema = z.object({
  currentPassword: z.string().min(6, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type CompanyProfileData = z.infer<typeof companyProfileSchema>;
type CompanyPasswordData = z.infer<typeof companyPasswordSchema>;

export default function CompanySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { company } = useCompanyAuth();

  const profileForm = useForm<CompanyProfileData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      fantasyName: company?.fantasyName || "",
      document: company?.document || "",
      address: company?.address || "",
      email: company?.email || "",
    },
  });

  const passwordForm = useForm<CompanyPasswordData>({
    resolver: zodResolver(companyPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: CompanyProfileData) => {
      await apiRequest("PUT", "/api/company/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/company/auth/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar perfil.",
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: CompanyPasswordData) => {
      await apiRequest("PUT", "/api/company/password", data);
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao alterar senha.",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: CompanyProfileData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: CompanyPasswordData) => {
    updatePasswordMutation.mutate(data);
  };

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Carregando informações da empresa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Configurações da Empresa</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Senha
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="ai-agent" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Atualize as informações básicas da sua empresa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="fantasyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Fantasia</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="document"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ/CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000/0000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="empresa@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Endereço completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Altere sua senha de acesso ao sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua senha atual" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite a nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirme a nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {updatePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Configurações do WhatsApp
              </CardTitle>
              <CardDescription>
                Configure suas instâncias do WhatsApp para automação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Smartphone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">WhatsApp Business</h3>
                <p className="text-gray-500 mb-4">
                  Configure suas instâncias do WhatsApp para automação de mensagens e atendimento.
                </p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Instância
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Mensagens Automáticas
              </CardTitle>
              <CardDescription>
                Configure mensagens de aniversário e lembretes automáticos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Mensagem de Aniversário</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Modelo da Mensagem
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-md resize-none"
                        rows={4}
                        placeholder="Olá {NOME}! A equipe da {EMPRESA} deseja um feliz aniversário! 🎉🎂"
                        defaultValue="Que este novo ano de vida seja repleto de alegrias, conquistas e momentos especiais.

Para comemorar, que tal agendar um horário especial conosco? 🎉✨

Feliz aniversário! 🎂"
                      />
                    </div>
                    <Button>
                      Salvar Mensagem
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Lembretes de Agendamento</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem de Lembrete
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-md resize-none"
                        rows={3}
                        placeholder="Olá {NOME}! Lembramos que você tem um agendamento amanhã às {HORA}."
                        defaultValue="Olá {NOME}! Lembramos que você tem um agendamento amanhã às {HORA} na {EMPRESA}.

Confirme sua presença ou entre em contato para reagendar. 📅"
                      />
                    </div>
                    <Button>
                      Salvar Lembrete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-agent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Agente de IA
              </CardTitle>
              <CardDescription>
                Configure o comportamento do seu assistente virtual inteligente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt do Agente IA
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={6}
                    placeholder="Exemplo: Você é um assistente virtual especializado em atendimento ao cliente..."
                    defaultValue="Você é um assistente virtual especializado em atendimento ao cliente para uma empresa de beleza e estética. 

Sempre seja educado, profissional e forneça respostas precisas sobre nossos serviços, horários e agendamentos.

Quando não souber uma informação específica, direcione o cliente para falar com um atendente humano."
                  />
                </div>

                <div className="flex gap-4">
                  <Button>
                    Salvar Configurações
                  </Button>
                  <Button variant="outline">
                    Testar Agente
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Teste do Agente IA</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem de Teste
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite uma mensagem para testar o agente..."
                          className="flex-1"
                        />
                        <Button>
                          Testar
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600 mb-2">Resposta do Agente:</p>
                      <p className="text-gray-800">
                        Digite uma mensagem acima para testar o agente IA.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}