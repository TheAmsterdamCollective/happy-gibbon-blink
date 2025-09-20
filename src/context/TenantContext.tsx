import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from './SessionContext';
import { supabase } from '@/integrations/supabase/client';

interface TenantContextType {
  tenantId: string | null;
  tenantSlug: string | null;
  tenantName: string | null;
  tenantTheme: any | null;
  isLoadingTenant: boolean;
  setTenantId: (id: string | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenantId: userTenantId, setTenantId: setUserTenantId, isLoading: isLoadingSession } = useSession();
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [tenantTheme, setTenantTheme] = useState<any | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState(true);

  // For MVP, we'll use a simple URL parameter or a hardcoded default for tenantId
  // In a real multi-tenant app, this would involve subdomain parsing or a more robust mechanism.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramTenantId = urlParams.get('tenantId');

    if (paramTenantId) {
      setCurrentTenantId(paramTenantId);
    } else if (userTenantId) {
      setCurrentTenantId(userTenantId);
    } else {
      // Fallback: if no tenantId in URL or user session, try to fetch a default tenant
      // This is a placeholder for a more robust subdomain-based tenant resolution
      supabase.from('tenants').select('id').limit(1).single()
        .then(({ data, error }) => {
          if (error) console.error('Error fetching default tenant:', error);
          if (data) setCurrentTenantId(data.id);
        })
        .finally(() => setIsLoadingTenant(false));
    }
  }, [userTenantId]);

  useEffect(() => {
    if (currentTenantId) {
      setIsLoadingTenant(true);
      supabase
        .from('tenants')
        .select('slug, name, theme')
        .eq('id', currentTenantId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching tenant details:', error);
            setTenantSlug(null);
            setTenantName(null);
            setTenantTheme(null);
          } else if (data) {
            setTenantSlug(data.slug);
            setTenantName(data.name);
            setTenantTheme(data.theme);
          }
        })
        .finally(() => setIsLoadingTenant(false));
    } else if (!isLoadingSession) {
      setIsLoadingTenant(false); // If no tenantId is resolved and session is loaded, stop loading
    }
  }, [currentTenantId, isLoadingSession]);

  const setTenant = (id: string | null) => {
    setCurrentTenantId(id);
    setUserTenantId(id); // Also update the tenantId in the session context
  };

  return (
    <TenantContext.Provider value={{ tenantId: currentTenantId, tenantSlug, tenantName, tenantTheme, isLoadingTenant, setTenantId: setTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};