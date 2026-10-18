"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type PlanType = "FREE" | "PAID_OAAS";

export type SubscriptionStatus = "ACTIVE" | "BLOCKED" | "CANCELED" | "REFUNDED" | "DEMO";

export interface UserSession {
  email: string;
  tenantName: string;
  plan: PlanType;
  quotaUsed: number;
  quotaLimit: number; // 3 no Plano Free, Infinity no Plano Pago
  subscriptionStatus: SubscriptionStatus;
  authenticatedAt: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsSubscriber: (email: string, tenantName?: string) => void;
  loginAsFreeDemo: (email?: string) => void;
  upgradeToPaid: () => void;
  switchPlan: (plan: PlanType) => void;
  incrementQuota: () => boolean; // Retorna true se permitido, false se atingiu limite
  logout: () => void;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: (reason?: string) => void;
  closeUpgradeModal: () => void;
  upgradeReason: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "bpo_oaas_session_v2";
const COOKIE_NAME = "bpo_session";

// Helpers para cookie sincronizado com o Middleware Next.js
function setSessionCookie(session: UserSession) {
  if (typeof document === "undefined") return;
  const cookieValue = encodeURIComponent(JSON.stringify(session));
  // Cookie válido por 30 dias com path=/
  document.cookie = `${COOKIE_NAME}=${cookieValue}; path=/; max-age=2592000; SameSite=Lax`;
}

function removeSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

function readSessionFromCookie(): UserSession | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (const c of cookies) {
    const [key, val] = c.trim().split("=");
    if (key === COOKIE_NAME && val) {
      try {
        return JSON.parse(decodeURIComponent(val)) as UserSession;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  useEffect(() => {
    try {
      // 1. Tenta carregar do Cookie (compatível com Middleware)
      const sessionFromCookie = readSessionFromCookie();
      if (sessionFromCookie && sessionFromCookie.email) {
        setUser(sessionFromCookie);
        setIsLoading(false);
        return;
      }

      // 2. Fallback para localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserSession;
        if (parsed && parsed.email) {
          setUser(parsed);
          setSessionCookie(parsed); // Reestabelece o cookie para o middleware
        }
      }
    } catch (e) {
      console.warn("Erro ao ler sessão de autenticação", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (session: UserSession | null) => {
    setUser(session);
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        setSessionCookie(session);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        removeSessionCookie();
      }
    } catch (e) {
      console.warn("Storage inacessível", e);
    }
  };

  const loginAsSubscriber = (email: string, tenantName?: string) => {
    const session: UserSession = {
      email: email.trim().toLowerCase(),
      tenantName: tenantName || "Empresa Assinante Kiwify",
      plan: "PAID_OAAS",
      quotaUsed: 0,
      quotaLimit: Infinity,
      subscriptionStatus: "ACTIVE",
      authenticatedAt: new Date().toISOString(),
    };
    saveSession(session);
  };

  const loginAsFreeDemo = (email?: string) => {
    const session: UserSession = {
      email: (email || "visitante.demo@exemplo.com.br").trim().toLowerCase(),
      tenantName: "Empresa Demonstração (Free)",
      plan: "FREE",
      quotaUsed: 0,
      quotaLimit: 3, // Limite estrito de 3 comprovantes no Free
      subscriptionStatus: "DEMO",
      authenticatedAt: new Date().toISOString(),
    };
    saveSession(session);
  };

  const upgradeToPaid = () => {
    if (!user) {
      loginAsSubscriber("assinante@suaempresa.com.br");
      setIsUpgradeModalOpen(false);
      return;
    }
    const upgraded: UserSession = {
      ...user,
      plan: "PAID_OAAS",
      quotaLimit: Infinity,
      subscriptionStatus: "ACTIVE",
    };
    saveSession(upgraded);
    setIsUpgradeModalOpen(false);
  };

  const switchPlan = (targetPlan: PlanType) => {
    if (!user) return;
    const updated: UserSession = {
      ...user,
      plan: targetPlan,
      quotaLimit: targetPlan === "FREE" ? 3 : Infinity,
      subscriptionStatus: targetPlan === "FREE" ? "DEMO" : "ACTIVE",
    };
    saveSession(updated);
  };

  const incrementQuota = (): boolean => {
    if (!user) return false;
    if (user.plan === "PAID_OAAS") {
      return true; // Ilimitado
    }

    if (user.quotaUsed >= user.quotaLimit) {
      openUpgradeModal(
        `Você atingiu o limite mensal de ${user.quotaLimit} comprovantes do Plano Free. Assine o Plano Pago OaaS para envios ilimitados.`
      );
      return false;
    }

    const updated: UserSession = {
      ...user,
      quotaUsed: user.quotaUsed + 1,
    };
    saveSession(updated);
    return true;
  };

  const logout = () => {
    saveSession(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const openUpgradeModal = (reason?: string) => {
    setUpgradeReason(
      reason || "Desbloqueie o potencial completo da Operação Financeira com IA por R$ 29,90/mês."
    );
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginAsSubscriber,
        loginAsFreeDemo,
        upgradeToPaid,
        switchPlan,
        incrementQuota,
        logout,
        isUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        upgradeReason,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
