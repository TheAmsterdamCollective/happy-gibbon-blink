import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  tenantId: string | null; // Will be set by TenantProvider
  setTenantId: (id: string | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setIsLoading(false);

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Fetch tenant_id from profile after sign-in/update
        if (currentSession?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', currentSession.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile tenant_id:', error);
          } else if (profile) {
            setTenantId(profile.tenant_id);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setTenantId(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setIsLoading(false);
      if (initialSession?.user) {
        supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', initialSession.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) console.error('Error fetching initial profile tenant_id:', error);
            else if (profile) setTenantId(profile.tenant_id);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ session, user, isLoading, tenantId, setTenantId }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};