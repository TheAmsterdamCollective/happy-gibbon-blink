import { useSession } from '@/context/SessionContext';
import { useTenant } from '@/context/TenantContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Home = () => {
  const { session, user, isLoading } = useSession();
  const { tenantName, tenantSlug, isLoadingTenant } = useTenant();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/login');
    }
  }, [session, isLoading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (isLoading || isLoadingTenant) {
    return <div className="min-h-screen flex items-center justify-center">Loading application...</div>;
  }

  if (!session) {
    return null; // Should redirect to login
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Welcome, {user?.email}!
        </h1>
        {tenantName && (
          <p className="text-xl text-gray-700 dark:text-gray-300">
            You are currently in the <span className="font-semibold">{tenantName}</span> tenant.
            {tenantSlug && <span className="text-sm text-gray-500 dark:text-gray-400"> (Slug: {tenantSlug})</span>}
          </p>
        )}
        <p className="text-lg text-gray-600 dark:text-gray-400">
          This is your protected home page. More features will be built here.
        </p>
        <Button onClick={handleLogout} className="mt-4">
          Logout
        </Button>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Home;