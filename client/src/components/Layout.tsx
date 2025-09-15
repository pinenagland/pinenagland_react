import { useState } from "react";
import Sidebar from "./Sidebar";
import BookReader from "./BookReader";
import AIAssistant from "./AIAssistant";
import TimelineExplorer from "./TimelineExplorer";
import MeditationModule from "./MeditationModule";
import ProfileModal from "./ProfileModal";

export default function Layout() {
  const [currentView, setCurrentView] = useState("book");
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showMeditationModal, setShowMeditationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentChapter, setCurrentChapter] = useState("prologue");

  const handleNavigation = (view: string) => {
    switch (view) {
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
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === "book" && (
          <div className="flex-1 flex">
            <BookReader 
              chapterId={currentChapter}
              onChapterChange={setCurrentChapter}
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
