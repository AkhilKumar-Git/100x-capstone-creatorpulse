 "use client";
 
import { LoginForm } from "@/components/auth/LoginForm";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

export default function LoginPage() {
  const { loading } = useRedirectIfAuthenticated();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <LoginForm />;
}