import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Calendar, 
  Settings, 
  MessageSquare, 
  Users, 
  Briefcase,
  Menu,
  LogOut,
  Home,
  Bell,
  Star,
  CheckSquare,
  Gift,
  Package,
  Ticket,
  DollarSign,
  BarChart3,
  CreditCard,
  HelpCircle
} from "lucide-react";
import { useCompanyAuth } from "@/hooks/useCompanyAuth";
import { useGlobalTheme } from "@/hooks/use-global-theme";
import { usePlan, type PlanPermissions } from "@/hooks/use-plan";
import { useQuery } from "@tanstack/react-query";
import type { GlobalSettings } from "@shared/schema";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import SubscriptionBlocked from "@/components/subscription-blocked";
import { CompanyAlerts } from "@/components/alerts/company-alerts";
import { GuidedTour } from "@/components/guided-tour";

interface CompanyLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/company/dashboard",
    icon: Home,
    permission: "dashboard" as keyof PlanPermissions | null,
  },
  {
    title: "Agendamentos",
    href: "/company/appointments",
    icon: Calendar,
    permission: "appointments" as keyof PlanPermissions | null,
  },
  {
    title: "Serviços",
    href: "/company/services",
    icon: Briefcase,
    permission: "services" as keyof PlanPermissions | null,
  },
  {
    title: "Profissionais",
    href: "/company/professionals",
    icon: Users,
    permission: "professionals" as keyof PlanPermissions | null,
  },
  {
    title: "Clientes",
    href: "/company/clients",
    icon: Users,
    permission: "clients" as keyof PlanPermissions | null,
  },
  {
    title: "Avaliações",
    href: "/company/reviews",
    icon: Star,
    permission: "reviews" as keyof PlanPermissions | null,
  },
  {
    title: "Tarefas",
    href: "/company/tasks",
    icon: CheckSquare,
    permission: "tasks" as keyof PlanPermissions | null,
  },
  {
    title: "Programa de pontos",
    href: "/company/points-program",
    icon: Gift,
    permission: "pointsProgram" as keyof PlanPermissions | null,
  },
  {
    title: "Fidelidade",
    href: "/company/fidelidade",
    icon: Gift,
    permission: "loyalty" as keyof PlanPermissions | null,
  },
  {
    title: "Estoque",
    href: "/company/estoque",
    icon: Package,
    permission: "inventory" as keyof PlanPermissions | null,
  },
  {
    title: "Mensagens",
    href: "/company/messages",
    icon: MessageSquare,
    permission: "messages" as keyof PlanPermissions | null,
  },
  {
    title: "Cupons",
    href: "/company/cupons",
    icon: Ticket,
    permission: "coupons" as keyof PlanPermissions | null,
  },
  {
    title: "Financeiro",
    href: "/company/financial",
    icon: DollarSign,
    permission: "financial" as keyof PlanPermissions | null,
  },
  {
    title: "Relatórios",
    href: "/company/relatorios",
    icon: BarChart3,
    permission: "reports" as keyof PlanPermissions | null,
  },
  {
    title: "Configurações",
    href: "/company/settings",
    icon: Settings,
    permission: "settings" as keyof PlanPermissions | null,
  },
  {
    title: "Suporte",
    href: "/company/suporte",
    icon: HelpCircle,
    permission: null, // Always visible regardless of plan
  },
  {
    title: "Assinatura",
    href: "/company/assinatura",
    icon: CreditCard,
    permission: null, // Always visible regardless of plan
  },

];

function SidebarContent() {
  const [location] = useLocation();
  const { company } = useCompanyAuth();
  const { hasPermission, isLoading } = usePlan();
  
  const { data: publicSettings } = useQuery<GlobalSettings>({
    queryKey: ["/api/public-settings"],
  });

  const { data: settings } = useQuery<GlobalSettings>({
    queryKey: ["/api/settings"],
    enabled: !!company, // Only fetch when user is authenticated
  });

  // Filter menu items based on plan permissions
  const visibleMenuItems = menuItems.filter(item => 
    item.permission === null || hasPermission(item.permission)
  );

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b p-6 flex items-center justify-center">
          {publicSettings?.logoUrl ? (
            <img 
              src={publicSettings.logoUrl} 
              alt="Logo" 
              className="w-[165px] h-auto rounded object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-6 flex items-center justify-center">
        {publicSettings?.logoUrl ? (
          <img 
            src={publicSettings.logoUrl} 
            alt="Logo" 
            className="w-[165px] h-auto rounded object-contain"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
        )}
      </div>
      
      <nav className="flex-1 space-y-2 p-4">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
      

      
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            window.location.href = "/api/company/auth/logout";
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { company } = useCompanyAuth();
  const { subscriptionStatus, isLoading: subscriptionLoading, isBlocked } = useSubscriptionStatus();
  
  // Aplica tema global dinamicamente
  useGlobalTheme();

  // Show subscription blocked screen if payment failed
  if (company && isBlocked && !subscriptionLoading) {
    return (
      <SubscriptionBlocked 
        subscriptionStatus={subscriptionStatus?.subscriptionStatus}
        paymentStatus={subscriptionStatus?.paymentStatus}
      />
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex h-full w-full flex-col bg-white border-r">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 lg:ml-64">
        <main className="min-h-screen pb-16">
          {children}
        </main>
        
        {/* Company Alerts */}
        {company && <CompanyAlerts />}
        
        {/* Guided Tour */}
        {company && <GuidedTour />}
        
        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 px-4 py-2 z-40">
          <div className="text-xs text-gray-500 text-center">
            Agenday ©2025 - Versão 1.0 - Powered by Halarum
          </div>
        </footer>
      </div>
    </>
  );
}