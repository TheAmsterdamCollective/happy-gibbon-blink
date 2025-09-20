import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/context/SessionContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && session) {
      navigate('/home');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Welcome to the Jongeren App!
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
          Participate in projects, vote, earn points, and connect with your community.
        </p>
        <Button onClick={() => navigate('/login')} className="px-8 py-3 text-lg">
          Get Started
        </Button>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;