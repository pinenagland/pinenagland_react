import { Eye, BookOpen, MessageCircle, History, Clover, UserCircle, Settings, LogIn, LogOut, X } from "lucide-react";
import devanAvatraLogo from "@/assets/devan-avatra-logo.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentView, onNavigate, isOpen = true, onClose }: SidebarProps) {
  const { firebaseUser, dbUser, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isMobile = useIsMobile();
  
  const handleNavigate = (view: string) => {
    onNavigate(view);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const navigationItems = [
    { id: "characters", label: "Character Gallery", icon: Eye },
    { id: "book", label: "Book Reader", icon: BookOpen },
    { id: "chat", label: "Devan Avatra", icon: MessageCircle },
    { id: "timeline", label: "History Explorer", icon: History },
    { id: "meditation", label: "Meditation & Yoga", icon: Clover },
    { id: "profile", label: "Profile & Goals", icon: UserCircle },
  ];

  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      <aside className={cn(
        "bg-card border-r border-border flex flex-col z-50",
        isMobile 
          ? "fixed left-0 top-0 h-full w-80 transform transition-transform duration-200 ease-in-out" +
            (isOpen ? " translate-x-0" : " -translate-x-full")
          : "w-64 relative"
      )}>
      {/* Header with Logo and Mobile Close */}
      <div className="p-6 border-b border-border relative">
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg"
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center">
            <img src={devanAvatraLogo} alt="Devan Avatra" className="w-16 h-16 object-cover" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-md w-full text-left transition-colors",
                "min-h-[44px] touch-manipulation", // Mobile touch targets
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
              data-testid={`nav-${item.id}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Summary */}
      <div className="p-4 border-t border-border">
        {firebaseUser ? (
          <div className="flex items-center gap-3">
            <img 
              src={firebaseUser.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"} 
              alt="User avatar" 
              className="w-8 h-8 rounded-full object-cover" 
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{dbUser?.name || firebaseUser.displayName || "User"}</p>
              <p className="text-muted-foreground text-xs">Prologue of 72</p>
            </div>
            <button 
              className="text-muted-foreground hover:text-foreground p-2 -mr-2 rounded hover:bg-muted min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
              onClick={logout}
              data-testid="button-logout"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-md text-left transition-colors hover:bg-muted min-h-[44px] touch-manipulation"
            data-testid="button-login"
          >
            <LogIn className="w-4 h-4" />
            <span className="text-sm">Sign In / Register</span>
          </button>
        )}
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    </aside>
    </>
  );
}
