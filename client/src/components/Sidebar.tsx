import { Eye, BookOpen, MessageCircle, History, Clover, UserCircle, Settings, LogIn, LogOut } from "lucide-react";
import devanAvatraLogo from "@/assets/devan-avatra-logo.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { firebaseUser, dbUser, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigationItems = [
    { id: "characters", label: "Character Gallery", icon: Eye },
    { id: "book", label: "Book Reader", icon: BookOpen },
    { id: "chat", label: "Devan Avatra", icon: MessageCircle },
    { id: "timeline", label: "History Explorer", icon: History },
    { id: "meditation", label: "Meditation & Yoga", icon: Clover },
    { id: "profile", label: "Profile & Goals", icon: UserCircle },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo Only */}
      <div className="p-6 border-b border-border">
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
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md w-full text-left transition-colors ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
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
              className="text-muted-foreground hover:text-foreground"
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
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-left transition-colors hover:bg-muted"
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
  );
}
