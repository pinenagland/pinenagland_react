import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, LogIn } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { firebaseUser, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!firebaseUser) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-semibold">Join the Journey</h3>
              <p className="text-muted-foreground">
                Create an account or sign in to save your progress through The Weavers of Eternity and unlock personalized features.
              </p>
            </div>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="w-full"
              data-testid="button-auth-prompt"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In / Create Account
            </Button>
            <AuthModal 
              isOpen={showAuthModal} 
              onClose={() => setShowAuthModal(false)} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}