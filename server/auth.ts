import session from "express-session";
import type { Express, RequestHandler } from "express";

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || 'admin-system-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
    name: 'connect.sid',
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const isCompanyAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    console.log('🔍 Company auth check - Session ID:', req.sessionID);
    console.log('🔍 Company auth check - Session data:', JSON.stringify(req.session, null, 2));
    console.log('🔍 Company auth check - Company ID:', req.session.companyId);

    const companyId = req.session.companyId;
    if (!companyId) {
      console.log('❌ No company ID in session - authentication failed');
      return res.status(401).json({ message: "Não autenticado" });
    }

    // Buscar dados da empresa para verificar status
    const { storage } = await import('./storage');
    const company = await storage.getCompanyById(companyId);

    console.log('📊 Company details:', {
      id: company?.id,
      name: company?.fantasyName,
      planStatus: company?.planStatus,
      subscriptionStatus: company?.subscriptionStatus,
      isActive: company?.isActive
    });

    if (!company) {
      console.log('❌ Company not found - destroying session');
      req.session.destroy();
      return res.status(401).json({ message: "Empresa não encontrada" });
    }

    // Verificar se a assinatura foi cancelada (verifica tanto subscription_status quanto plan_status)
    if (company.subscriptionStatus === 'cancelled' || company.subscriptionStatus === 'canceled' ||
        company.planStatus === 'cancelled' || company.planStatus === 'canceled') {
      console.log('🚫 BLOCKING ACCESS - Company subscription is cancelled!');
      console.log('🔄 Destroying session for company ID:', companyId);
      req.session.destroy();
      return res.status(403).json({
        message: "Assinatura Cancelada",
        redirectTo: "/company/assinatura",
        reason: "subscription_cancelled",
        details: "Sua assinatura foi cancelada. Por favor, escolha um novo plano para continuar."
      });
    }

    console.log('✅ Company authenticated successfully:', companyId);
    next();
  } catch (error) {
    console.error("Company authentication error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};