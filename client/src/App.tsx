import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalSettingsProvider } from "@/components/global-settings-provider";
import AdminLayout from "@/components/layout/admin-layout";
import CompanyLayout from "./components/layout/company-layout";
import Login from "@/pages/login";
import CompanyLogin from "@/pages/company-login";
import CompanyDashboard from "@/pages/company-dashboard-new";
import CompanySettings from "@/pages/company-settings";
import CompanyServices from "@/pages/company-services";
import CompanyProfessionals from "@/pages/company-professionals";
import CompanyClients from "@/pages/company-clients";
import CompanyReminders from "@/pages/company-reminders";
import CompanyReviews from "@/pages/company-reviews";
import CompanyTasks from "@/pages/company-tasks";
import CompanyPointsProgram from "@/pages/company-points-program";
import CompanyLoyalty from "@/pages/company-loyalty";
import CompanyInventory from "@/pages/company-inventory";
import CompanyMessages from "@/pages/company-messages";
import CompanyCoupons from "@/pages/company-coupons";
import CompanyFinancial from "@/pages/company-financial";
import CompanyReports from "@/pages/company-reports";
import CompanySupport from "@/pages/company-support";
import CompanySubscriptionManagement from "@/pages/company-subscription-management";
import DashboardAppointments from "@/pages/dashboard-appointments";
import Dashboard from "@/pages/dashboard";
import Companies from "@/pages/companies";
import Plans from "@/pages/plans";
import Status from "@/pages/status";
import SettingsPage from "@/pages/settings";
import Admins from "@/pages/admins";
import AdminAlerts from "@/pages/admin-alerts";
import AdminCoupons from "@/pages/admin-coupons";
import AdminTestSubscription from "@/pages/admin-test-subscription";
import AdminSubscriptions from "@/pages/admin-subscriptions";
import AdminSupport from "@/pages/admin-support";
import AdminAffiliates from "@/pages/admin-affiliates";
import AdminPlanEmbed from "@/pages/admin-plan-embed";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminTrainingVideos from "@/pages/admin-training-videos";
import Subscription from "@/pages/subscription";
import PublicReview from "@/pages/public-review";
import EmbedPlans from "@/pages/embed-plans";
import ProfessionalDashboard from "@/pages/professional-dashboard";
import ProfessionalLogin from "@/pages/professional-login";
import ProfessionalProfile from "@/pages/professional-profile";
import ProfessionalClients from "@/pages/professional-clients";
import AffiliateRegister from "@/pages/affiliate-register";
import AffiliateLogin from "@/pages/affiliate-login";
import AffiliateDashboard from "@/pages/affiliate-dashboard";
import Register from "@/pages/register";
import ThankYou from "@/pages/thank-you";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* Company Routes */}
      <Route path="/" component={CompanyLogin} />
      <Route path="/company" component={CompanyLogin} />
      <Route path="/company-login" component={CompanyLogin} />
      <Route path="/company/login" component={CompanyLogin} />
      <Route path="/company/auth/login" component={CompanyLogin} />

      {/* Affiliate Routes */}
      <Route path="/affiliate/register" component={AffiliateRegister} />
      <Route path="/affiliate/login" component={AffiliateLogin} />
      <Route path="/affiliate/dashboard" component={AffiliateDashboard} />
      <Route path="/afiliado/registro" component={AffiliateRegister} />
      <Route path="/afiliado/login" component={AffiliateLogin} />
      <Route path="/afiliado/dashboard" component={AffiliateDashboard} />

      {/* Professional Routes */}
      <Route path="/profissional/login" component={ProfessionalLogin} />
      <Route path="/profissional/dashboard" component={ProfessionalDashboard} />
      <Route path="/profissional/perfil" component={ProfessionalProfile} />
      <Route path="/profissional/clientes" component={ProfessionalClients} />

      {/* Registration Routes */}
      <Route path="/cadastro" component={Register} />
      <Route path="/register" component={Register} />

      {/* Thank You Page */}
      <Route path="/obrigado" component={ThankYou} />

      {/* Company Dashboard Routes */}
      <Route path="/dashboard">
        <CompanyLayout>
          <CompanyDashboard />
        </CompanyLayout>
      </Route>
      <Route path="/company/dashboard">
        <CompanyLayout>
          <CompanyDashboard />
        </CompanyLayout>
      </Route>
      <Route path="/company/appointments">
        <CompanyLayout>
          <DashboardAppointments />
        </CompanyLayout>
      </Route>
      <Route path="/company/services">
        <CompanyLayout>
          <CompanyServices />
        </CompanyLayout>
      </Route>
      <Route path="/company/professionals">
        <CompanyLayout>
          <CompanyProfessionals />
        </CompanyLayout>
      </Route>
      <Route path="/company/clients">
        <CompanyLayout>
          <CompanyClients />
        </CompanyLayout>
      </Route>
      <Route path="/company/settings">
        <CompanyLayout>
          <CompanySettings />
        </CompanyLayout>
      </Route>
      <Route path="/company/reminders">
        <CompanyLayout>
          <CompanyReminders />
        </CompanyLayout>
      </Route>
      <Route path="/company/reviews">
        <CompanyLayout>
          <CompanyReviews />
        </CompanyLayout>
      </Route>
      <Route path="/company/tasks">
        <CompanyLayout>
          <CompanyTasks />
        </CompanyLayout>
      </Route>
      <Route path="/company/points">
        <CompanyLayout>
          <CompanyPointsProgram />
        </CompanyLayout>
      </Route>
      <Route path="/company/points-program">
        <CompanyLayout>
          <CompanyPointsProgram />
        </CompanyLayout>
      </Route>
      <Route path="/company/programa-pontos">
        <CompanyLayout>
          <CompanyPointsProgram />
        </CompanyLayout>
      </Route>
      <Route path="/company/loyalty">
        <CompanyLayout>
          <CompanyLoyalty />
        </CompanyLayout>
      </Route>
      <Route path="/company/fidelidade">
        <CompanyLayout>
          <CompanyLoyalty />
        </CompanyLayout>
      </Route>
      <Route path="/company/inventory">
        <CompanyLayout>
          <CompanyInventory />
        </CompanyLayout>
      </Route>
      <Route path="/company/estoque">
        <CompanyLayout>
          <CompanyInventory />
        </CompanyLayout>
      </Route>
      <Route path="/company/messages">
        <CompanyLayout>
          <CompanyMessages />
        </CompanyLayout>
      </Route>
      <Route path="/company/coupons">
        <CompanyLayout>
          <CompanyCoupons />
        </CompanyLayout>
      </Route>
      <Route path="/company/cupons">
        <CompanyLayout>
          <CompanyCoupons />
        </CompanyLayout>
      </Route>
      <Route path="/company/financial">
        <CompanyLayout>
          <CompanyFinancial />
        </CompanyLayout>
      </Route>
      <Route path="/company/reports">
        <CompanyLayout>
          <CompanyReports />
        </CompanyLayout>
      </Route>
      <Route path="/company/relatorios">
        <CompanyLayout>
          <CompanyReports />
        </CompanyLayout>
      </Route>
      <Route path="/company/configuracoes">
        <CompanyLayout>
          <CompanySettings />
        </CompanyLayout>
      </Route>
      <Route path="/company/suporte">
        <CompanyLayout>
          <CompanySupport />
        </CompanyLayout>
      </Route>
      <Route path="/company/assinatura">
        <CompanyLayout>
          <CompanySubscriptionManagement />
        </CompanyLayout>
      </Route>

      {/* Public Routes */}
      <Route path="/assinatura" component={Subscription} />
      <Route path="/review/:token" component={PublicReview} />
      <Route path="/embed/plans" component={EmbedPlans} />

      {/* Admin Routes */}
      <Route path="/login" component={Login} />
      <Route path="/admin/login" component={Login} />
      <Route path="/administrador/login" component={Login} />

      <Route path="/administrador">
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin">
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/dashboard">
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </Route>
      <Route path="/administrador/dashboard">
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/companies">
        <AdminLayout>
          <Companies />
        </AdminLayout>
      </Route>
      <Route path="/administrador/empresas">
        <AdminLayout>
          <Companies />
        </AdminLayout>
      </Route>
      <Route path="/admin/plans">
        <AdminLayout>
          <Plans />
        </AdminLayout>
      </Route>
      <Route path="/administrador/planos">
        <AdminLayout>
          <Plans />
        </AdminLayout>
      </Route>
      <Route path="/admin/status">
        <AdminLayout>
          <Status />
        </AdminLayout>
      </Route>
      <Route path="/administrador/status">
        <AdminLayout>
          <Status />
        </AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout>
          <SettingsPage />
        </AdminLayout>
      </Route>
      <Route path="/administrador/configuracoes">
        <AdminLayout>
          <SettingsPage />
        </AdminLayout>
      </Route>
      <Route path="/admin/admins">
        <AdminLayout>
          <Admins />
        </AdminLayout>
      </Route>
      <Route path="/administrador/administradores">
        <AdminLayout>
          <Admins />
        </AdminLayout>
      </Route>
      <Route path="/admin/alerts">
        <AdminLayout>
          <AdminAlerts />
        </AdminLayout>
      </Route>
      <Route path="/administrador/alertas">
        <AdminLayout>
          <AdminAlerts />
        </AdminLayout>
      </Route>
      <Route path="/admin/coupons">
        <AdminLayout>
          <AdminCoupons />
        </AdminLayout>
      </Route>
      <Route path="/administrador/cupons">
        <AdminLayout>
          <AdminCoupons />
        </AdminLayout>
      </Route>
      <Route path="/admin/subscriptions">
        <AdminLayout>
          <AdminSubscriptions />
        </AdminLayout>
      </Route>
      <Route path="/administrador/assinaturas">
        <AdminLayout>
          <AdminSubscriptions />
        </AdminLayout>
      </Route>
      <Route path="/admin/support">
        <AdminLayout>
          <AdminSupport />
        </AdminLayout>
      </Route>
      <Route path="/administrador/suporte">
        <AdminLayout>
          <AdminSupport />
        </AdminLayout>
      </Route>
      <Route path="/administrador/teste-assinatura">
        <AdminLayout>
          <AdminTestSubscription />
        </AdminLayout>
      </Route>
      <Route path="/administrador/afiliados">
        <AdminLayout>
          <AdminAffiliates />
        </AdminLayout>
      </Route>
      <Route path="/administrador/treinamentos">
        <AdminLayout>
          <AdminTrainingVideos />
        </AdminLayout>
      </Route>
      <Route path="/administrador/embed-planos">
        <AdminLayout>
          <AdminPlanEmbed />
        </AdminLayout>
      </Route>
      <Route path="/admin/analytics">
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      </Route>
      <Route path="/administrador/analytics">
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalSettingsProvider />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;