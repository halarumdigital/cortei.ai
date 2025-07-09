import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Calendar, Clock, Phone, Plus, LogOut, Edit, Save, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useGlobalTheme } from "@/hooks/use-global-theme";
import type { GlobalSettings } from "@shared/schema";

interface Professional {
  id: number;
  name: string;
  email: string;
  companyId: number;
}

interface Appointment {
  id: number;
  clientName: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  price: number;
  serviceName: string;
  professionalName: string;
  statusName: string;
  statusColor: string;
  status: string;
}

interface AppointmentStatus {
  id: number;
  name: string;
  color: string;
}

export default function ProfessionalDashboard() {
  const [, setLocation] = useLocation();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'appointments'>('appointments');
  
  // Busca configurações globais para logo e cores
  const { data: globalSettings } = useQuery<GlobalSettings>({
    queryKey: ["/api/public-settings"],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Aplica tema global
  useGlobalTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [newAppointmentForm, setNewAppointmentForm] = useState({
    clientId: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar configurações globais
  const { data: settings } = useQuery({
    queryKey: ["/api/public-settings"],
    staleTime: 1000 * 60 * 5,
  });

  // Aplicar cores globais
  useEffect(() => {
    if (settings?.primaryColor) {
      const root = document.documentElement;
      const primaryHsl = settings.primaryColor;
      
      try {
        if (primaryHsl.startsWith('hsl(')) {
          const hslMatch = primaryHsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
          if (hslMatch) {
            const [, h, s, l] = hslMatch;
            root.style.setProperty('--primary', `${h} ${s}% ${l}%`);
            root.style.setProperty('--primary-foreground', '0 0% 98%');
          }
        }
      } catch (error) {
        console.warn('Erro ao aplicar cor primária:', error);
      }
    }
  }, [settings]);

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/professional/status");
        const data = await response.json();
        
        if (data.isAuthenticated) {
          setProfessional(data.professional);
        } else {
          setLocation("/profissional/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setLocation("/profissional/login");
      }
    };
    
    checkAuth();
  }, [setLocation]);

  // Buscar agendamentos
  const { data: appointments = [], isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ["/api/professional/appointments"],
    enabled: !!professional,
  });

  // Buscar status de agendamentos
  const { data: appointmentStatuses = [] } = useQuery({
    queryKey: ["/api/professional/appointment-statuses"],
    enabled: !!professional,
  });

  // Buscar serviços da empresa para novo agendamento
  const { data: services = [] } = useQuery({
    queryKey: ["/api/professional/services"],
    enabled: !!professional,
  });

  // Buscar clientes da empresa
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/professional/clients"],
    enabled: !!professional,
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/professional/logout", "POST"),
    onSuccess: () => {
      toast({ title: "Logout realizado com sucesso" });
      setLocation("/profissional/login");
    },
    onError: () => {
      toast({ title: "Erro ao fazer logout", variant: "destructive" });
    }
  });

  // Mutation para atualizar agendamento
  const updateAppointmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/professional/appointments/${data.id}`, "PUT", data),
    onSuccess: () => {
      toast({ title: "Agendamento atualizado com sucesso" });
      setEditingAppointment(null);
      queryClient.invalidateQueries({ queryKey: ["/api/professional/appointments"] });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar agendamento", variant: "destructive" });
    }
  });

  // Mutation para criar novo agendamento
  const createAppointmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/professional/appointments", "POST", data),
    onSuccess: () => {
      toast({ title: "Agendamento criado com sucesso" });
      setIsNewAppointmentOpen(false);
      setNewAppointmentForm({
        clientId: '',
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        serviceId: '',
        appointmentDate: '',
        appointmentTime: '',
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/appointments"] });
    },
    onError: () => {
      toast({ title: "Erro ao criar agendamento", variant: "destructive" });
    }
  });

  // Mutation para criar novo cliente
  const createClientMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/professional/clients", "POST", data),
    onSuccess: (newClient) => {
      toast({ title: "Cliente criado com sucesso" });
      setIsNewClientModalOpen(false);
      setNewClientForm({ name: '', phone: '', email: '' });
      // Seleciona o cliente recém-criado
      setNewAppointmentForm(prev => ({
        ...prev,
        clientId: newClient.id.toString(),
        clientName: newClient.name,
        clientPhone: newClient.phone || '',
        clientEmail: newClient.email || ''
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/professional/clients"] });
    },
    onError: () => {
      toast({ title: "Erro ao criar cliente", variant: "destructive" });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!newAppointmentForm.clientName || !newAppointmentForm.clientPhone || 
        !newAppointmentForm.serviceId || !newAppointmentForm.appointmentDate || 
        !newAppointmentForm.appointmentTime) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    createAppointmentMutation.mutate({
      ...newAppointmentForm,
      serviceId: parseInt(newAppointmentForm.serviceId)
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const startEditing = (appointment: Appointment) => {
    setEditingAppointment(appointment.id);
    setEditForm({
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      notes: appointment.notes || '',
      status: appointment.statusName || appointment.status,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime
    });
  };

  const saveEdit = () => {
    if (editingAppointment) {
      updateAppointmentMutation.mutate({
        id: editingAppointment,
        ...editForm
      });
    }
  };

  const cancelEdit = () => {
    setEditingAppointment(null);
    setEditForm({});
  };

  // Funções do calendário
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt: Appointment) => {
      // Extract date part from appointment date (handles both ISO and simple date formats)
      const aptDateStr = apt.appointmentDate.split('T')[0];
      return aptDateStr === dateStr;
    });
  };



  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

    // Dias vazios no início
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 md:h-16"></div>);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = isCurrentMonth && day === today.getDate();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          className={`h-8 md:h-16 p-1 border cursor-pointer transition-colors ${
            isToday ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
          } ${isSelected ? 'bg-blue-200' : 'hover:bg-gray-50'}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="text-xs md:text-sm font-medium">{day}</div>
          {dayAppointments.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {dayAppointments.slice(0, 2).map((apt, idx) => (
                <div
                  key={idx}
                  className="w-2 h-2 md:w-3 md:h-3 rounded-full"
                  style={{ backgroundColor: apt.statusColor || '#6b7280' }}
                />
              ))}
              {dayAppointments.length > 2 && (
                <div className="text-xs text-gray-500">+{dayAppointments.length - 2}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div 
        className="text-white p-4"
        style={{ 
          backgroundColor: globalSettings?.primaryColor || '#2563eb',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Dashboard do Profissional</h1>
              <p className="opacity-80">Bem-vindo, {professional.name}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="px-4 py-2 rounded text-white transition-all duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
              }}
            >
              {logoutMutation.isPending ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - ALWAYS VISIBLE */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8 px-4">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Calendário
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Todos os Agendamentos
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Botão Novo Agendamento */}
        <div className="mb-6">
          <button
            onClick={() => setIsNewAppointmentOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'calendar' ? (
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="h-8 flex items-center justify-center font-medium text-gray-500 text-xs md:text-sm">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </div>

            {/* Selected Date Appointments */}
            {selectedDate && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Agendamentos para {selectedDate.toLocaleDateString('pt-BR')}
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getAppointmentsForDate(selectedDate).map((appointment: Appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{appointment.clientName}</div>
                        <div className="text-sm text-gray-600">
                          {formatTime(appointment.appointmentTime)} - {appointment.serviceName}
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 rounded text-white text-xs"
                        style={{ backgroundColor: appointment.statusColor || "#6b7280" }}
                      >
                        {appointment.statusName}
                      </span>
                    </div>
                  ))}
                  {getAppointmentsForDate(selectedDate).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhum agendamento para esta data</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* All Appointments Tab */
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Todos os Agendamentos</h2>
            
            {appointmentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Carregando agendamentos...</p>
              </div>
            ) : appointmentsError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                Erro ao carregar agendamentos. Tente recarregar a página.
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded">
                <p className="text-gray-600">Nenhum agendamento encontrado</p>
                <p className="text-gray-500 text-sm">Você ainda não tem agendamentos.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appointments.map((appointment: Appointment) => (
                  <div key={appointment.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{appointment.clientName}</h3>
                        <div className="flex items-center space-x-2">
                          <span 
                            className="px-2 py-1 rounded text-white text-sm"
                            style={{ backgroundColor: appointment.statusColor || "#6b7280" }}
                          >
                            {appointment.statusName}
                          </span>
                          <button
                            onClick={() => startEditing(appointment)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>📅 {formatDate(appointment.appointmentDate)}</div>
                        <div>🕐 {formatTime(appointment.appointmentTime)}</div>
                        <div>✂️ {appointment.serviceName} - R$ {appointment.price}</div>
                        {appointment.clientPhone && (
                          <div>📞 {appointment.clientPhone}</div>
                        )}
                        {appointment.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <strong>Observações:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar Agendamento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  value={editForm.clientName || ''}
                  onChange={(e) => setEditForm({...editForm, clientName: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="text"
                  value={editForm.clientPhone || ''}
                  onChange={(e) => setEditForm({...editForm, clientPhone: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Telefone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  value={editForm.appointmentDate || ''}
                  onChange={(e) => setEditForm({...editForm, appointmentDate: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horário</label>
                <input
                  type="time"
                  value={editForm.appointmentTime || ''}
                  onChange={(e) => setEditForm({...editForm, appointmentTime: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editForm.status || ''}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o status</option>
                  {appointmentStatuses.map((status: AppointmentStatus) => (
                    <option key={status.id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observações"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveEdit}
                disabled={updateAppointmentMutation.isPending}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {updateAppointmentMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={cancelEdit}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Agendamento */}
      {isNewAppointmentOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Novo Agendamento</h3>
            
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente *</label>
                <div className="flex gap-2">
                  <select
                    value={newAppointmentForm.clientId}
                    onChange={(e) => {
                      const selectedClient = clients.find((c: any) => c.id === parseInt(e.target.value));
                      if (selectedClient) {
                        setNewAppointmentForm({
                          ...newAppointmentForm,
                          clientId: e.target.value,
                          clientName: selectedClient.name,
                          clientPhone: selectedClient.phone || '',
                          clientEmail: selectedClient.email || ''
                        });
                      } else {
                        setNewAppointmentForm({
                          ...newAppointmentForm,
                          clientId: '',
                          clientName: '',
                          clientPhone: '',
                          clientEmail: ''
                        });
                      }
                    }}
                    className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client: any) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.phone && `- ${client.phone}`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsNewClientModalOpen(true)}
                    className="px-3 py-2 text-white rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ backgroundColor: primaryColor, focusRingColor: primaryColor }}
                    title="Adicionar novo cliente"
                  >
                    +
                  </button>
                </div>
              </div>

              {newAppointmentForm.clientId && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">
                    <strong>Cliente selecionado:</strong> {newAppointmentForm.clientName}
                    {newAppointmentForm.clientPhone && <><br/><strong>Telefone:</strong> {newAppointmentForm.clientPhone}</>}
                    {newAppointmentForm.clientEmail && <><br/><strong>Email:</strong> {newAppointmentForm.clientEmail}</>}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Serviço *</label>
                <select
                  value={newAppointmentForm.serviceId}
                  onChange={(e) => setNewAppointmentForm({...newAppointmentForm, serviceId: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((service: any) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - R$ {service.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data *</label>
                <input
                  type="date"
                  value={newAppointmentForm.appointmentDate}
                  onChange={(e) => setNewAppointmentForm({...newAppointmentForm, appointmentDate: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horário *</label>
                <input
                  type="time"
                  value={newAppointmentForm.appointmentTime}
                  onChange={(e) => setNewAppointmentForm({...newAppointmentForm, appointmentTime: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea
                  value={newAppointmentForm.notes}
                  onChange={(e) => setNewAppointmentForm({...newAppointmentForm, notes: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observações (opcional)"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createAppointmentMutation.isPending}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {createAppointmentMutation.isPending ? 'Criando...' : 'Criar Agendamento'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewAppointmentOpen(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Novo Cliente */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Adicionar Novo Cliente</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newClientForm.name.trim()) {
                createClientMutation.mutate(newClientForm);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({...newClientForm, name: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do cliente"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="text"
                  value={newClientForm.phone}
                  onChange={(e) => setNewClientForm({...newClientForm, phone: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Telefone (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newClientForm.email}
                  onChange={(e) => setNewClientForm({...newClientForm, email: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email (opcional)"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createClientMutation.isPending}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {createClientMutation.isPending ? 'Criando...' : 'Criar Cliente'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}