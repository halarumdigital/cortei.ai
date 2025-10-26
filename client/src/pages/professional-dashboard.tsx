import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { TrendingUp, Clock, Calendar as CalendarIcon, CalendarDays, User, MoreHorizontal, LogOut, Menu, Edit, ChevronLeft, ChevronRight, Check, ChevronsUpDown, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGlobalTheme } from "@/hooks/use-global-theme";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Professional {
  id: number;
  name: string;
  email: string;
  companyId: number;
}

interface DashboardMetrics {
  today: number;
  todayTrend: string;
  week: number;
  weekTrend: string;
  month: number;
  monthTrend: string;
  weeklyData: Array<{
    week: string;
    appointments: number;
    height: number;
  }>;
}

export default function ProfessionalDashboard() {
  const [, setLocation] = useLocation();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [activeNav, setActiveNav] = useState<'dashboard' | 'calendar' | 'profile'>('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState([
    { id: 1, clientName: "João Silva", date: "2025-10-26", time: "09:00", service: "Corte de Cabelo", professionalId: 1 },
    { id: 2, clientName: "Maria Santos", date: "2025-10-26", time: "10:30", service: "Manicure", professionalId: 1 },
    { id: 3, clientName: "Pedro Costa", date: "2025-10-26", time: "14:00", service: "Barba", professionalId: 1 },
    { id: 4, clientName: "Ana Paula", date: "2025-10-27", time: "11:00", service: "Corte + Barba", professionalId: 1 },
    { id: 5, clientName: "Carlos Lima", date: "2025-10-28", time: "15:30", service: "Corte de Cabelo", professionalId: 1 },
    { id: 6, clientName: "Fernanda Souza", date: "2025-10-28", time: "16:30", service: "Manicure", professionalId: 1 },
    { id: 7, clientName: "Ricardo Alves", date: "2025-10-30", time: "10:00", service: "Barba", professionalId: 1 },
    { id: 8, clientName: "Juliana Costa", date: "2025-10-30", time: "14:00", service: "Corte de Cabelo", professionalId: 1 },
  ]);
  const [editForm, setEditForm] = useState({ date: '', time: '', service: '' });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    clientId: '',
    serviceId: '',
    date: '',
    time: '',
  });
  const [clientComboOpen, setClientComboOpen] = useState(false);
  const { toast } = useToast();

  // Aplica as cores globais do sistema
  useGlobalTheme();

  // Função para navegar entre meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Função para obter dias da semana atual
  const getCurrentWeekDays = () => {
    const today = selectedDate || new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 6 = Sábado
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  // Função para contar agendamentos por dia
  const getAppointmentCount = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr).length;
  };

  // Função para abrir modal de edição
  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setEditForm({
      date: appointment.date,
      time: appointment.time,
      service: appointment.service
    });
    setEditModalOpen(true);
  };

  // Função para salvar edição
  const handleSaveEdit = () => {
    if (!editingAppointment) return;

    setAppointments(prev => prev.map(apt =>
      apt.id === editingAppointment.id
        ? { ...apt, date: editForm.date, time: editForm.time, service: editForm.service }
        : apt
    ));

    toast({
      title: "Agendamento atualizado!",
      description: `${editingAppointment.clientName} - ${editForm.service}`,
    });

    setEditModalOpen(false);
    setEditingAppointment(null);
  };

  // Gerar horários disponíveis (08:00 - 18:00)
  const getAvailableTimeSlots = (selectedDate: string) => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Verificar se o horário está ocupado
        const isOccupied = appointments.some(
          apt => apt.date === selectedDate && apt.time === time
        );
        if (!isOccupied) {
          slots.push(time);
        }
      }
    }
    return slots;
  };

  // Abrir modal de adicionar agendamento
  const handleOpenAddModal = () => {
    setNewAppointment({
      clientId: '',
      serviceId: '',
      date: selectedDate?.toISOString().split('T')[0] || '',
      time: '',
    });
    setAddModalOpen(true);
  };

  // Adicionar novo agendamento
  const handleAddAppointment = () => {
    if (!newAppointment.clientId || !newAppointment.serviceId || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const client = clients.find((c: any) => c.id === parseInt(newAppointment.clientId));
    const service = services.find((s: any) => s.id === parseInt(newAppointment.serviceId));

    const newApt = {
      id: appointments.length + 1,
      clientName: client?.name || '',
      date: newAppointment.date,
      time: newAppointment.time,
      service: service?.name || '',
      professionalId: professional?.id || 1,
    };

    setAppointments(prev => [...prev, newApt]);

    toast({
      title: "Agendamento criado!",
      description: `${client?.name} - ${service?.name}`,
    });

    setAddModalOpen(false);
    setNewAppointment({
      clientId: '',
      serviceId: '',
      date: '',
      time: '',
    });
  };

  // Fetch global settings for logo
  const { data: settings } = useQuery({
    queryKey: ["/api/public-settings"],
    staleTime: 1000 * 60 * 5,
  });

  // Check authentication
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

  // Fetch appointments for metrics (real data from API)
  const { data: apiAppointments = [] } = useQuery({
    queryKey: ["/api/professional/appointments"],
    enabled: !!professional,
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/professional/clients"],
    enabled: !!professional,
  });

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ["/api/professional/services"],
    enabled: !!professional,
  });

  // Calculate metrics from appointments
  const metrics: DashboardMetrics = {
    today: apiAppointments.filter((apt: any) => {
      const aptDate = new Date(apt.appointmentDate).toDateString();
      const today = new Date().toDateString();
      return aptDate === today;
    }).length,
    todayTrend: "+8%",
    week: apiAppointments.filter((apt: any) => {
      const aptDate = new Date(apt.appointmentDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return aptDate >= weekAgo;
    }).length,
    weekTrend: "+12%",
    month: apiAppointments.filter((apt: any) => {
      const aptDate = new Date(apt.appointmentDate);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return aptDate >= monthAgo;
    }).length,
    monthTrend: "+5%",
    weeklyData: [
      { week: "Sem 1", appointments: 45, height: 60 },
      { week: "Sem 2", appointments: 62, height: 80 },
      { week: "Sem 3", appointments: 38, height: 45 },
      { week: "Sem 4", appointments: 71, height: 90 },
      { week: "Atual", appointments: 52, height: 70 },
    ]
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/professional/logout", { method: "POST" });
      toast({ title: "Logout realizado com sucesso" });
      setLocation("/profissional/login");
    } catch (error) {
      toast({ title: "Erro ao fazer logout", variant: "destructive" });
    }
  };

  const showMetricModal = (type: 'today' | 'week' | 'month') => {
    const modalData = {
      today: {
        title: "Atendimentos de Hoje",
        value: metrics.today,
        details: "Próximo agendamento às 14:30",
        trend: "+8% comparado a ontem"
      },
      week: {
        title: "Atendimentos da Semana",
        value: metrics.week,
        details: "Meta semanal: 90 atendimentos",
        trend: "+12% comparado à semana passada"
      },
      month: {
        title: "Atendimentos do Mês",
        value: metrics.month,
        details: "Meta mensal: 400 atendimentos",
        trend: "+5% comparado ao mês passado"
      }
    };

    setModalContent(modalData[type]);
    setModalOpen(true);
  };

  const showWeekModal = (weekData: any) => {
    setModalContent({
      title: `Detalhes - ${weekData.week}`,
      value: weekData.appointments,
      details: "Atendimentos",
      trend: "+5% em relação à semana anterior"
    });
    setModalOpen(true);
  };

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/60">
        <div className="flex items-center justify-between px-4 h-14" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          {/* Left: Logout button */}
          <button
            className="p-2 hover:bg-red-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-red-600"
            onClick={handleLogout}
            title="Sair"
          >
            <LogOut className="w-6 h-6" />
          </button>

          {/* Center: Title */}
          <h1 className="text-lg font-semibold truncate flex-1 text-center px-4">
            Dashboard do Profissional
          </h1>

          {/* Right: Menu button */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-4">
                {/* User info */}
                <div className="pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{professional?.name}</p>
                      <p className="text-sm text-gray-600">{professional?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      setLocation('/profissional/perfil');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Meu Perfil</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-14 pb-20 overflow-x-hidden">
        {/* Dashboard View */}
        {activeNav === 'dashboard' && (
          <>
            {/* Dashboard Metrics Section */}
            <div className="px-4 py-6">
              <h1 className="text-2xl font-semibold mb-6 text-gray-900">
                Dashboard
              </h1>

          {/* Revenue Cards Section */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {/* Today Revenue Card */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Faturamento Hoje
                </h3>
                <div className="text-2xl font-bold text-primary mb-1">
                  R$ 0,00
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+15%</span>
                </div>
              </div>
            </div>

            {/* Week Revenue Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Faturamento Semana
                </h3>
                <div className="text-2xl font-bold text-primary mb-1">
                  R$ 0,00
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+20%</span>
                </div>
              </div>
            </div>

            {/* Month Revenue Card */}
            <div className="bg-gradient-to-br from-primary/5 to-white border border-primary/20 rounded-xl p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Faturamento Mês
                </h3>
                <div className="text-2xl font-bold text-primary mb-1">
                  R$ 0,00
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {/* Today Card */}
            <div
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/40 rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer active:translate-y-0 active:scale-98"
              onClick={() => showMetricModal('today')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Hoje
                    </h3>
                    <p className="text-sm text-gray-600">
                      Atendimentos de hoje
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {metrics.today}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{metrics.todayTrend}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Week Card */}
            <div
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/40 rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer active:translate-y-0 active:scale-98"
              onClick={() => showMetricModal('week')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Semana
                    </h3>
                    <p className="text-sm text-gray-600">
                      Últimos 7 dias
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {metrics.week}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{metrics.weekTrend}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Month Card */}
            <div
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/40 rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer active:translate-y-0 active:scale-98"
              onClick={() => showMetricModal('month')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Mês
                    </h3>
                    <p className="text-sm text-gray-600">
                      Últimos 30 dias
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {metrics.month}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{metrics.monthTrend}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Chart Section */}
        <div className="px-4 pb-6">
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Atendimentos por Semana
              </h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Chart Container */}
            <div className="w-full h-64 bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 overflow-x-auto">
              <div className="flex items-end justify-between h-full min-w-full gap-2">
                {metrics.weeklyData.map((data, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 flex-1 cursor-pointer"
                    onClick={() => showWeekModal(data)}
                  >
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 hover:opacity-80 ${
                        index === 4 ? 'bg-primary/60' : 'bg-primary'
                      }`}
                      style={{ height: `${data.height}%` }}
                    />
                    <span className="text-xs text-gray-600">{data.week}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm text-gray-600">Atendimentos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary/60 rounded-full"></div>
                <span className="text-sm text-gray-600">Semana Atual</span>
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Calendar View */}
        {activeNav === 'calendar' && (
          <div className="px-4 py-6">
            {/* Calendar Card */}
            <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6 gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <h2 className="text-base font-semibold text-gray-900 text-center flex-1 min-w-0">
                    {currentMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                      .replace(/^\w/, c => c.toUpperCase())
                      .replace('.', '')}
                  </h2>
                  <button
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      calendarView === 'month'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setCalendarView('month')}
                  >
                    Mês
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      calendarView === 'week'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setCalendarView('week')}
                  >
                    Semana
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="w-full">
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days - Month View */}
                {calendarView === 'month' && (() => {
                  const year = currentMonth.getFullYear();
                  const month = currentMonth.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const lastDay = new Date(year, month + 1, 0);
                  const daysInMonth = lastDay.getDate();
                  const startingDayOfWeek = firstDay.getDay();

                  const days = [];

                  // Dias do mês anterior
                  const prevMonthLastDay = new Date(year, month, 0).getDate();
                  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
                    const day = prevMonthLastDay - i;
                    const date = new Date(year, month - 1, day);
                    days.push({ date, isCurrentMonth: false });
                  }

                  // Dias do mês atual
                  for (let i = 1; i <= daysInMonth; i++) {
                    const date = new Date(year, month, i);
                    days.push({ date, isCurrentMonth: true });
                  }

                  // Dias do próximo mês para completar a grade
                  const remainingDays = 42 - days.length; // 6 semanas * 7 dias
                  for (let i = 1; i <= remainingDays; i++) {
                    const date = new Date(year, month + 1, i);
                    days.push({ date, isCurrentMonth: false });
                  }

                  return (
                    <div className="grid grid-cols-7 gap-1">
                      {days.map(({ date, isCurrentMonth }, index) => {
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        const isToday = new Date().toDateString() === date.toDateString();
                        const appointmentCount = getAppointmentCount(date);

                        return (
                          <div
                            key={index}
                            className={`h-14 flex flex-col items-center justify-center relative cursor-pointer rounded-lg transition-colors ${
                              isSelected
                                ? ''
                                : isCurrentMonth
                                ? 'hover:bg-gray-50 text-gray-900'
                                : 'text-gray-400'
                            }`}
                            onClick={() => setSelectedDate(date)}
                          >
                            {isSelected ? (
                              <div className="bg-primary text-white rounded-2xl w-12 h-12 flex flex-col items-center justify-center">
                                <span className="text-sm font-semibold">{date.getDate()}</span>
                                {appointmentCount > 0 && (
                                  <span className="text-[10px] font-medium mt-0.5">{appointmentCount}</span>
                                )}
                              </div>
                            ) : (
                              <>
                                <span className={`text-sm ${isCurrentMonth ? 'font-medium' : ''}`}>
                                  {date.getDate()}
                                </span>
                                {appointmentCount > 0 && (
                                  <span className="absolute bottom-2 text-[10px] font-semibold bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center">
                                    {appointmentCount}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Calendar days - Week View */}
                {calendarView === 'week' && (() => {
                  const weekDays = getCurrentWeekDays();

                  return (
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((date, index) => {
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        const isToday = new Date().toDateString() === date.toDateString();
                        const appointmentCount = getAppointmentCount(date);

                        return (
                          <div
                            key={index}
                            className={`flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-primary text-white shadow-md'
                                : isToday
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedDate(date)}
                          >
                            <span className="text-xs font-medium mb-1">
                              {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                            </span>
                            <span className={`text-2xl font-bold mb-1 ${isSelected ? 'text-white' : ''}`}>
                              {date.getDate()}
                            </span>
                            {appointmentCount > 0 && (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? 'bg-white text-primary'
                                  : 'bg-primary text-white'
                              }`}>
                                {appointmentCount} {appointmentCount === 1 ? 'agend.' : 'agends.'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Appointments Section */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Agendamentos para {selectedDate.toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long'
                  })}
                </h3>
                <button
                  className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-lg px-4 py-1.5 flex items-center gap-1"
                  onClick={handleOpenAddModal}
                >
                  <span className="text-lg font-bold">+</span>
                  <span className="text-sm font-medium">Adicionar</span>
                </button>
              </div>

              {(() => {
                const selectedDateStr = selectedDate.toISOString().split('T')[0];
                const filteredAppointments = appointments.filter(
                  apt => apt.date === selectedDateStr
                );

                if (filteredAppointments.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        Nenhum agendamento para este dia
                      </p>
                      <button
                        className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-lg px-4 py-1.5"
                        onClick={handleOpenAddModal}
                      >
                        <span className="text-lg">+</span> Adicionar Agendamento
                      </button>
                    </div>
                  );
                }

                const appointmentConfigs = [
                  {
                    bgColor: 'bg-primary/20',
                    iconColor: 'text-primary',
                    badgeColor: 'bg-primary',
                    badgeText: 'Reunião',
                    icon: User
                  },
                  {
                    bgColor: 'bg-green-100',
                    iconColor: 'text-primary',
                    badgeColor: 'bg-primary',
                    badgeText: 'Consulta',
                    icon: CalendarIcon
                  },
                  {
                    bgColor: 'bg-purple-100',
                    iconColor: 'text-purple-500',
                    badgeColor: 'bg-purple-500',
                    badgeText: 'Ligação',
                    icon: Clock
                  },
                ];

                return (
                  <div className="space-y-3">
                    {filteredAppointments.map((appointment, index) => {
                      const config = appointmentConfigs[index % appointmentConfigs.length];
                      const IconComponent = config.icon;

                      return (
                        <div
                          key={appointment.id}
                          className="bg-gray-50 rounded-2xl p-4 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon Circle */}
                            <div className={`${config.bgColor} w-10 h-10 rounded-full flex items-center justify-center shrink-0`}>
                              <IconComponent className={`${config.iconColor} w-5 h-5`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 mb-1 text-sm">
                                {appointment.service}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {appointment.time} - {new Date(appointment.date).toLocaleDateString('pt-BR')}
                              </p>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-600">
                                  {appointment.clientName}
                                </span>
                              </div>
                            </div>

                            {/* Badge and Edit Button */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className={`${config.badgeColor} text-white text-xs font-medium px-3 py-1 rounded-full`}>
                                {config.badgeText}
                              </span>
                              <button
                                onClick={() => handleEditAppointment(appointment)}
                                className="text-gray-500 hover:text-primary transition-colors p-1"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/60"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex justify-around items-center h-16 px-2">
          <button
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-2 px-3 transition-colors rounded-lg ${
              activeNav === 'dashboard' ? 'text-primary' : 'text-gray-600'
            }`}
            onClick={() => setActiveNav('dashboard')}
          >
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span className="text-xs">Dashboard</span>
          </button>

          <button
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-2 px-3 transition-colors rounded-lg ${
              activeNav === 'calendar' ? 'text-primary' : 'text-gray-600'
            }`}
            onClick={() => setActiveNav('calendar')}
          >
            <CalendarDays className="w-6 h-6 mb-1" />
            <span className="text-xs">Calendário</span>
          </button>

          <button
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-2 px-3 transition-colors rounded-lg text-gray-600"
            onClick={() => setLocation('/profissional/clientes')}
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs">Clientes</span>
          </button>
        </div>
      </div>

      {/* Metrics Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{modalContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="text-5xl font-bold text-primary mb-4">
              {modalContent?.value}
            </div>
            <div className="text-base text-gray-600 mb-4">
              {modalContent?.details}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>{modalContent?.trend}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
          </DialogHeader>
          {editingAppointment && (
            <>
              <div className="mb-3 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Cliente: {editingAppointment.clientName}
                </p>
              </div>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Data</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Horário</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-service">Serviço</Label>
                  <Select
                    value={editForm.service}
                    onValueChange={(value) => setEditForm({ ...editForm, service: value })}
                  >
                    <SelectTrigger id="edit-service">
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corte de Cabelo">Corte de Cabelo</SelectItem>
                      <SelectItem value="Manicure">Manicure</SelectItem>
                      <SelectItem value="Barba">Barba</SelectItem>
                      <SelectItem value="Corte + Barba">Corte + Barba</SelectItem>
                      <SelectItem value="Pedicure">Pedicure</SelectItem>
                      <SelectItem value="Coloração">Coloração</SelectItem>
                      <SelectItem value="Massagem">Massagem</SelectItem>
                      <SelectItem value="Escova">Escova</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingAppointment(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleSaveEdit}
                >
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Appointment Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-client">Cliente *</Label>
              <Popover open={clientComboOpen} onOpenChange={setClientComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientComboOpen}
                    className="w-full justify-between"
                  >
                    {newAppointment.clientId
                      ? clients.find((client: any) => client.id.toString() === newAppointment.clientId)?.name
                      : "Selecione o cliente"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client: any) => (
                          <CommandItem
                            key={client.id}
                            value={client.name}
                            onSelect={() => {
                              setNewAppointment({ ...newAppointment, clientId: client.id.toString() });
                              setClientComboOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                newAppointment.clientId === client.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-service">Serviço *</Label>
              <Select
                value={newAppointment.serviceId}
                onValueChange={(value) => setNewAppointment({ ...newAppointment, serviceId: value })}
              >
                <SelectTrigger id="add-service">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service: any) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}{service.price ? ` - R$ ${Number(service.price).toFixed(2)}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-date">Data *</Label>
              <Input
                id="add-date"
                type="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value, time: '' })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-time">Horário Disponível *</Label>
              <Select
                value={newAppointment.time}
                onValueChange={(value) => setNewAppointment({ ...newAppointment, time: value })}
                disabled={!newAppointment.date}
              >
                <SelectTrigger id="add-time">
                  <SelectValue placeholder={newAppointment.date ? "Selecione o horário" : "Selecione uma data primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {newAppointment.date && getAvailableTimeSlots(newAppointment.date).length > 0 ? (
                    getAvailableTimeSlots(newAppointment.date).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-slots" disabled>
                      Nenhum horário disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {newAppointment.date && getAvailableTimeSlots(newAppointment.date).length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Todos os horários estão ocupados neste dia
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setAddModalOpen(false);
                setNewAppointment({
                  clientId: '',
                  serviceId: '',
                  date: '',
                  time: '',
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleAddAppointment}
            >
              Criar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
