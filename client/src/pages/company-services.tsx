import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Grid, List } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useGlobalTheme } from "@/hooks/use-global-theme";
import { FloatingHelpButton } from "@/components/floating-help-button";

interface Service {
  id: number;
  name: string;
  description?: string;
  duration: number;
  price: string | number;
  color: string;
  points: number;
  isActive: boolean | number; // Pode vir como 0/1 do banco MySQL
  createdAt: string;
  updatedAt: string;
}

const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().or(z.literal('')),
  duration: z.number().min(1, "Duração deve ser maior que 0"),
  price: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  color: z.string().min(1, "Cor é obrigatória").refine(
    (color) => /^#[0-9A-F]{6}$/i.test(color),
    { message: "Cor deve ser um código hexadecimal válido" }
  ),
  points: z.number().min(0, "Pontos devem ser maior ou igual a 0").default(0),
  isActive: z.union([z.boolean(), z.number()]).transform((val) => Boolean(val)).default(true),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const colorPalette = [
  '#ef4444', '#14b8a6', '#3b82f6', '#84cc16', '#f59e0b',
  '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f97316',
  '#6366f1', '#a855f7', '#f43f5e', '#22d3ee', '#eab308'
];

export default function CompanyServices() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const globalSettings = useGlobalTheme();

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['/api/company/services'],
  });

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 30,
      price: 0,
      color: "#3b82f6",
      points: 0,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const response = await fetch('/api/company/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Erro ao criar serviço');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company/services'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      console.log('🚀 updateMutation.mutationFn called!');
      if (!editingService) {
        console.log('❌ No editingService, returning');
        return;
      }
      console.log('✅ Updating service with data:', data);
      const response = await fetch(`/api/company/services/${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        let errorMessage = 'Erro ao atualizar serviço';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Update failed:', errorData);
        } catch {
          const errorText = await response.text();
          console.error('Update failed:', errorText);
        }
        throw new Error(errorMessage);
      }
      const result = await response.json();
      console.log('Update successful:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('✅ updateMutation.onSuccess called with result:', result);
      queryClient.invalidateQueries({ queryKey: ['/api/company/services'] });
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      console.log('❌ updateMutation.onError called with error:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/company/services/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erro ao excluir serviço');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company/services'] });
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    // Garantir que isActive seja sempre boolean
    const sanitizedData = {
      ...data,
      isActive: Boolean(data.isActive)
    };

    if (editingService) {
      updateMutation.mutate(sanitizedData);
    } else {
      createMutation.mutate(sanitizedData);
    }
  };

  const handleEdit = (service: Service) => {
    console.log('🖊️ handleEdit called with service:', service);
    setEditingService(service);

    const priceValue = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
    console.log('💰 Price conversion:', service.price, '->', priceValue);

    // Converter isActive para boolean se for number
    const isActiveValue = typeof service.isActive === 'number' ? Boolean(service.isActive) : service.isActive;
    console.log('✅ isActive conversion:', service.isActive, '->', isActiveValue, 'Type:', typeof service.isActive);

    form.setValue('name', service.name);
    form.setValue('description', service.description || '');
    form.setValue('duration', service.duration);
    form.setValue('price', priceValue);
    form.setValue('color', service.color);
    form.setValue('points', service.points || 0);
    form.setValue('isActive', isActiveValue);

    console.log('📝 Form values after setting:', form.getValues());
    console.log('🔍 isActive value type and value:', typeof form.getValues().isActive, form.getValues().isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setEditingService(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600">Gerencie seus serviços e preços</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'text-white' : ''}
              style={viewMode === 'grid' ? { backgroundColor: globalSettings?.primaryColor || '#5e6d8d' } : {}}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'text-white' : ''}
              style={viewMode === 'list' ? { backgroundColor: globalSettings?.primaryColor || '#5e6d8d' } : {}}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={openCreateDialog} 
                className="text-white"
                style={{ backgroundColor: globalSettings?.primaryColor || '#5e6d8d' }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
                <DialogDescription>
                  {editingService 
                    ? 'Edite as informações do serviço.' 
                    : 'Adicione um novo serviço à sua empresa.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nome do Serviço
                    </Label>
                    <Input
                      id="name"
                      className="col-span-3"
                      placeholder="Ex: Corte de Cabelo"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="col-span-4 text-sm text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descrição
                    </Label>
                    <Input
                      id="description"
                      className="col-span-3"
                      placeholder="Descrição do serviço (opcional)"
                      {...form.register('description')}
                    />
                    {form.formState.errors.description && (
                      <p className="col-span-4 text-sm text-red-500">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duração (minutos)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      className="col-span-3"
                      {...form.register('duration', { valueAsNumber: true })}
                    />
                    {form.formState.errors.duration && (
                      <p className="col-span-4 text-sm text-red-500">
                        {form.formState.errors.duration.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Preço (R$)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      className="col-span-3"
                      {...form.register('price', { valueAsNumber: true })}
                    />
                    {form.formState.errors.price && (
                      <p className="col-span-4 text-sm text-red-500">
                        {form.formState.errors.price.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="points" className="text-right">
                      Pontos de Fidelidade
                    </Label>
                    <Input
                      id="points"
                      type="number"
                      min="0"
                      className="col-span-3"
                      placeholder="0"
                      {...form.register('points', { valueAsNumber: true })}
                    />
                    {form.formState.errors.points && (
                      <p className="col-span-4 text-sm text-red-500">
                        {form.formState.errors.points.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      Cor do Serviço
                    </Label>
                    <div className="col-span-3">
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {colorPalette.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-lg border-2 ${
                              form.watch('color') === color ? 'border-gray-800' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => form.setValue('color', color)}
                          />
                        ))}
                      </div>
                      <Input
                        type="text"
                        value={form.watch('color')}
                        onChange={(e) => form.setValue('color', e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isActive" className="text-right">
                      Serviço ativo
                    </Label>
                    <Switch
                      id="isActive"
                      checked={Boolean(form.watch('isActive'))}
                      onCheckedChange={(checked) => form.setValue('isActive', checked)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => console.log('🔘 Submit button clicked, form valid:', form.formState.isValid, 'errors:', form.formState.errors)}
                  >
                    {editingService ? 'Atualizar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </div>
                  <Badge
                    className={service.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {service.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    Duração: {service.duration}min
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    R$ {Number(service.price).toFixed(2)}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    {service.points || 0} pontos de fidelidade
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: service.color }}
                  />
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-gray-600">
                      {service.duration}min • R$ {Number(service.price).toFixed(2)} • {service.points || 0} pontos
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={service.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {service.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {services.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum serviço encontrado
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Comece criando seu primeiro serviço para organizar melhor sua empresa.
            </p>
            <Button 
              onClick={openCreateDialog} 
              className="text-white"
              style={{ backgroundColor: globalSettings?.primaryColor || '#5e6d8d' }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Serviço
            </Button>
          </CardContent>
        </Card>
      )}
      <FloatingHelpButton menuLocation="services" />
    </div>
  );
}