import { Eye, BookOpen, MessageCircle, History, Clover, UserCircle, Settings } from "lucide-react";
import devanAvatraLogo from "@/assets/devan-avatra-logo.jpg";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navigationItems = [
    { id: "book", label: "Book Reader", icon: BookOpen },
    { id: "chat", label: "Devan Avatra", icon: MessageCircle },
    { id: "timeline", label: "History Explorer", icon: History },
    { id: "meditation", label: "Meditation & Yoga", icon: Clover },
    { id: "profile", label: "Profile & Goals", icon: UserCircle },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo and Title */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
            <img src={devanAvatraLogo} alt="Devan Avatra" className="w-10 h-10 object-cover" />
          </div>
          <div>
            <h1 className="font-serif font-semibold text-lg">The Weavers of Eternity</h1>
            <p className="text-muted-foreground text-sm">Chronicle of Egyptian Gods</p>
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
        <div className="flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" 
            alt="User avatar" 
            className="w-8 h-8 rounded-full object-cover" 
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Syed</p>
            <p className="text-muted-foreground text-xs">Chapter 7 of 50</p>
          </div>
          <button 
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
