import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSession } from '@/context/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/context/TenantContext';

const Navbar: React.FC = () => {
  const { session, isLoading } = useSession();
  const { tenantName, tenantSlug } = useTenant();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={session ? "/home" : "/"} className="text-2xl font-bold">
          Jongeren App
          {tenantName && <span className="ml-2 text-sm opacity-80">({tenantName})</span>}
        </Link>
        <div className="flex items-center space-x-4">
          {!isLoading && session ? (
            <>
              <Link to="/home" className="hover:underline">Home</Link>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </>
          ) : (
            !isLoading && (
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Login
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;