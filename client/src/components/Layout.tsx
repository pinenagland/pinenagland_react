import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import BookReader from "./BookReader";
import AIAssistant from "./AIAssistant";
import TimelineExplorer from "./TimelineExplorer";
import MeditationModule from "./MeditationModule";
import ProfileModal from "./ProfileModal";
import CharacterGallery from "./CharacterGallery";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Layout() {
  const [currentView, setCurrentView] = useState("book");
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showMeditationModal, setShowMeditationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCharacterGallery, setShowCharacterGallery] = useState(false);
  const [currentChapter, setCurrentChapter] = useState("prologue");
  const [selectedBookId, setSelectedBookId] = useState("weavers_of_eternity"); // Default to Egyptian mythology book
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Reset chapter when book changes to ensure valid chapter for selected book
  useEffect(() => {
    if (selectedBookId === "weavers_of_eternity") {
      setCurrentChapter("prologue"); // Start with prologue for Egyptian mythology
    } else if (selectedBookId === "can_discovering_god") {
      setCurrentChapter("can_ch1"); // Start with first chapter for CAN book
    } else if (selectedBookId === "the_falcon_and_the_eye") {
      setCurrentChapter("horus_ch1"); // Start with first chapter for Horus book
    }
  }, [selectedBookId]);

  const handleNavigation = (view: string) => {
    switch (view) {
      case "characters":
        setShowCharacterGallery(true);
        break;
      case "timeline":
        setShowTimelineModal(true);
        break;
      case "meditation":
        setShowMeditationModal(true);
        break;
      case "profile":
        setShowProfileModal(true);
        break;
      default:
        setCurrentView(view);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigation}
        selectedBookId={selectedBookId}
        onBookSelect={setSelectedBookId}
        isOpen={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Hamburger Menu */}
        {isMobile && (
          <header className="bg-card border-b border-border p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2 min-h-[44px] min-w-[44px] touch-manipulation"
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold truncate">Devan Avatra</h1>
            <div className="w-11" /> {/* Spacer for centering */}
          </header>
        )}
        {currentView === "book" && (
          <div className={`flex-1 ${isMobile ? 'flex flex-col' : 'flex'}`}>
            <BookReader 
              chapterId={currentChapter}
              onChapterChange={setCurrentChapter}
              bookId={selectedBookId}
            />
            <AIAssistant chapterId={currentChapter} />
          </div>
        )}
        
        {currentView === "chat" && (
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-serif font-semibold mb-6">Devan Avatra Conversations</h1>
              <AIAssistant chapterId={null} standalone={true} />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCharacterGallery && (
        <CharacterGallery onClose={() => setShowCharacterGallery(false)} />
      )}
      
      {showTimelineModal && (
        <TimelineExplorer onClose={() => setShowTimelineModal(false)} />
      )}
      
      {showMeditationModal && (
        <MeditationModule onClose={() => setShowMeditationModal(false)} />
      )}
      
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}
