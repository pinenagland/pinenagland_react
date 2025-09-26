import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  Type, 
  Palette, 
  Bookmark,
  Maximize2,
  BookOpen,
  FileText,
  List
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { BookChapter } from "@shared/schema";

// Import book covers
import weaversOfEternityCover from "@assets/THE WEAVERS OF ETERNITY-Book cover_1758843792985.png";
import canDiscoveringGodCover from "@assets/CAN Book cover_1758843792985.png";

// Book cover mapping function
const getBookCover = (bookId: string): string | null => {
  const coverMap: Record<string, string> = {
    'weavers_of_eternity': weaversOfEternityCover,
    'can_discovering_god': canDiscoveringGodCover,
  };
  return coverMap[bookId] || null;
};

type ContentType = 'cover' | 'author-speech' | 'about-book' | 'index' | 'chapter';

interface BookContent {
  id: string;
  type: ContentType;
  title: string;
  content?: string;
  chapterNumber?: number;
  chapter?: BookChapter;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage?: string;
  authorSpeech?: string;
  aboutTheBook?: string;
  bookIndex?: string;
  genre: string;
  totalChapters: number;
}

interface BookReaderProps {
  chapterId: string;
  onChapterChange: (chapterId: string | null) => void;
  bookId?: string;
}

export default function BookReader({ chapterId, onChapterChange, bookId }: BookReaderProps) {
  const [fontSize, setFontSize] = useState("text-lg");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [viewingSection, setViewingSection] = useState(true); // Track if we're viewing book sections
  const [lastNotifiedId, setLastNotifiedId] = useState<string | null>(null); // Track last notified ID to prevent loops
  const isMobile = useIsMobile();
  
  const getFontSizeClass = () => {
    switch (fontSize) {
      case "text-sm": return "text-sm";
      case "text-lg": return "text-lg";
      case "text-xl": return "text-xl";
      default: return "text-lg";
    }
  };

  const { data: book } = useQuery<Book>({
    queryKey: ["/api/books", bookId],
    queryFn: () => {
      if (!bookId) return Promise.resolve(null);
      return fetch(`/api/books/${bookId}`).then(res => res.json());
    },
    enabled: !!bookId
  });

  const { data: allChapters } = useQuery<BookChapter[]>({
    queryKey: ["/api/books", bookId, "chapters"],
    queryFn: () => {
      if (!bookId) return Promise.resolve([]);
      return fetch(`/api/books/${bookId}/chapters`).then(res => res.json());
    },
    enabled: !!bookId // Only fetch when bookId exists
  });

  // getCurrentChapter will be called after currentContent is defined

  // Create unified content structure with useMemo for stability
  const bookContent = useMemo((): BookContent[] => {
    const content: BookContent[] = [];
    
    if (book) {
      // Add book sections first
      content.push({
        id: 'cover',
        type: 'cover',
        title: book.title
      });
      
      if (book.authorSpeech) {
        content.push({
          id: 'author-speech',
          type: 'author-speech', 
          title: 'From the Author',
          content: book.authorSpeech
        });
      }
      
      if (book.aboutTheBook) {
        content.push({
          id: 'about-book',
          type: 'about-book',
          title: 'About the Book',
          content: book.aboutTheBook
        });
      }
      
      if (book.bookIndex) {
        content.push({
          id: 'index',
          type: 'index',
          title: 'Index',
          content: book.bookIndex
        });
      }
      
      // Add chapters
      if (allChapters && allChapters.length > 0) {
        allChapters.forEach((chapter) => {
          if (chapter && chapter.id && chapter.title) {
            content.push({
              id: chapter.id,
              type: 'chapter',
              title: chapter.title,
              chapterNumber: chapter.chapterNumber,
              chapter
            });
          }
        });
      }
    }
    
    return content;
  }, [book, allChapters]);
  
  // Find current content based on chapterId or set to first item
  useEffect(() => {
    if (bookContent.length > 0) {
      let targetIndex = 0;
      let isSection = true;
      
      if (chapterId) {
        const index = bookContent.findIndex(content => content.id === chapterId);
        if (index >= 0) {
          targetIndex = index;
          isSection = bookContent[index].type !== 'chapter';
        }
      }
      
      setCurrentContentIndex(targetIndex);
      setViewingSection(isSection);
      
      // Sync parent state only if different from last notification
      const currentContent = bookContent[targetIndex];
      if (currentContent) {
        const newId = currentContent.type === 'chapter' ? currentContent.id : null;
        if (newId !== lastNotifiedId) {
          setLastNotifiedId(newId);
          onChapterChange(newId);
        }
      }
    }
  }, [chapterId, bookContent, bookId]); // Remove onChapterChange dependency to prevent loops
  
  if (!book && bookId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading book...</p>
        </div>
      </div>
    );
  }
  
  if (!bookId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please select a book to start reading</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookContent.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Book content not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const currentContent = bookContent[currentContentIndex];
  if (!currentContent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Content not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Get current chapter from currentContent (now that it's defined)
  const chapter = (!viewingSection && currentContent?.type === 'chapter') ? currentContent.chapter : undefined;

  const totalContent = bookContent.length;
  const progressPercent = totalContent > 0 ? ((currentContentIndex + 1) / totalContent) * 100 : 0;

  const navigateContent = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? currentContentIndex - 1 : currentContentIndex + 1;
    if (newIndex >= 0 && newIndex < bookContent.length) {
      setCurrentContentIndex(newIndex);
      const newContent = bookContent[newIndex];
      setViewingSection(newContent.type !== 'chapter');
      
      // Always update parent state: chapter ID for chapters, null for sections
      const newId = newContent.type === 'chapter' ? newContent.id : null;
      if (newId !== lastNotifiedId) {
        setLastNotifiedId(newId);
        onChapterChange(newId);
      }
    }
  };

  return (
    <div className={`flex-1 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Top Bar */}
      <header className={cn(
        "bg-card border-b border-border flex items-center justify-between",
        isMobile ? "h-14 px-4 flex-col gap-2 py-2" : "h-16 px-6"
      )}>
        <div className={cn(
          "flex items-center gap-2",
          isMobile ? "w-full justify-between" : "gap-4"
        )}>
          <h2 className={cn(
            "font-serif font-semibold truncate",
            isMobile ? "text-lg flex-1" : "text-xl"
          )}>{currentContent.title}</h2>
          {currentContent.type === 'chapter' && currentContent.chapter?.era && (
            <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">
              {currentContent.chapter.era}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {currentContent.type === 'cover' ? 'Cover' :
             currentContent.type === 'author-speech' ? 'Author' :
             currentContent.type === 'about-book' ? 'About' :
             currentContent.type === 'index' ? 'Index' : 
             `Ch.${currentContent.chapterNumber}`}
          </Badge>
        </div>
        
        <div className={cn(
          "flex items-center",
          isMobile ? "w-full justify-between gap-2" : "gap-4"
        )}>
          {/* Progress indicator */}
          <div className={cn(
            "flex items-center gap-2 text-sm text-muted-foreground",
            isMobile && "flex-1 min-w-0"
          )}>
            {!isMobile && <span>Progress:</span>}
            <Progress value={progressPercent} className={isMobile ? "flex-1" : "w-20"} />
            <span className="text-xs">{Math.round(progressPercent)}%</span>
          </div>
          
          {/* Reading controls */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "sm"}
              onClick={() => {
                setFontSize(prevSize => {
                  switch (prevSize) {
                    case "text-lg": return "text-xl";
                    case "text-xl": return "text-sm"; 
                    case "text-sm": return "text-lg";
                    default: return "text-lg";
                  }
                });
              }}
              className={cn(isMobile && "min-h-[44px] min-w-[44px] p-2")}
              data-testid="button-font-size"
            >
              <Type className="w-4 h-4" />
            </Button>
            {!isMobile && (
              <>
                <Button variant="ghost" size="sm" data-testid="button-theme">
                  <Palette className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-bookmark">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "sm"}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={cn(isMobile && "min-h-[44px] min-w-[44px] p-2")}
              data-testid="button-fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Book Content */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn(
          "mx-auto",
          isMobile ? "p-4 max-w-none" : "p-8 max-w-4xl"
        )}>
          
          {/* Content Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {currentContent.type === 'chapter' ? (
                <span className="text-accent font-mono text-sm">CH.{currentContent.chapterNumber}</span>
              ) : (
                <div className="flex items-center gap-2">
                  {currentContent.type === 'cover' && <BookOpen className="w-5 h-5 text-accent" />}
                  {currentContent.type === 'author-speech' && <FileText className="w-5 h-5 text-accent" />}
                  {currentContent.type === 'about-book' && <FileText className="w-5 h-5 text-accent" />}
                  {currentContent.type === 'index' && <List className="w-5 h-5 text-accent" />}
                </div>
              )}
              <div className="flex-1 h-px bg-border"></div>
              {currentContent.type === 'chapter' && currentContent.chapter?.timeSpan && (
                <span className="text-muted-foreground text-sm">{String(currentContent.chapter.timeSpan)}</span>
              )}
            </div>
            <h1 className="font-serif text-4xl font-semibold mb-4">{currentContent.title}</h1>
            {currentContent.type === 'chapter' && currentContent.chapter?.commentary && (
              <p className="text-muted-foreground text-lg leading-relaxed">{String(currentContent.chapter.commentary)}</p>
            )}
          </div>

          {/* Content Illustration */}
          {currentContent.type === 'cover' && book && getBookCover(book.id) && (
            <div className="mb-8 text-center">
              <img 
                src={getBookCover(book.id)!} 
                alt={`Cover of ${book.title}`}
                className="w-full max-w-md mx-auto rounded-lg shadow-lg" 
              />
              <div className="mt-6 space-y-2">
                <h2 className="font-serif text-2xl font-bold">{book.title}</h2>
                <p className="text-lg text-muted-foreground">by {book.author}</p>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">{book.description}</p>
              </div>
            </div>
          )}
          
          {currentContent.type === 'chapter' && currentContent.chapter?.figures && (currentContent.chapter.figures as string[]).length > 0 && (
            <div className="mb-8">
              <img 
                src={(currentContent.chapter.figures as string[])[0]} 
                alt={`Illustration for ${currentContent.title}`}
                className="w-full h-64 object-cover rounded-lg shadow-lg" 
              />
              <p className="text-center text-sm text-muted-foreground mt-2">
                Historical illustration related to {currentContent.title}
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className={`prose max-w-none font-serif leading-relaxed ${getFontSizeClass()}`}>
            {currentContent.type === 'cover' && (
              <div className="text-center space-y-6">
                <div className="text-lg text-muted-foreground">
                  Welcome to this literary journey. Use the navigation below to begin reading.
                </div>
              </div>
            )}
            
            {(currentContent.type === 'author-speech' || currentContent.type === 'about-book' || currentContent.type === 'index') && currentContent.content && (
              <div className="first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-accent first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                {currentContent.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={index === 0 ? "" : "mt-4"}>
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
            
            {currentContent.type === 'chapter' && currentContent.chapter?.narrative && (
              <div className="first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-accent first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                {String(currentContent.chapter.narrative).split('\n\n').map((paragraph, index) => (
                  <p key={index} className={index === 0 ? "" : "mt-4"}>
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Historical Context Cards - Only for chapters */}
          {currentContent.type === 'chapter' && currentContent.chapter && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                    <div className="w-5 h-5 bg-accent rounded-full"></div>
                    Historical Context
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Period:</span>
                      <span className="font-medium">{currentContent.chapter.timeSpan || "Ancient History"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Era:</span>
                      <span className="font-medium">{currentContent.chapter.era}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Tags:</span>
                      <div className="flex gap-1 flex-wrap">
                        {(currentContent.chapter.tags as string[])?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                    <div className="w-5 h-5 bg-wellness rounded-full"></div>
                    Global Influence
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <span>Divine kingship concepts spread to Nubia, Greece, and Rome</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <span>Eye of Horus became universal symbol of protection</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <span>Influenced Mesopotamian and Persian royal ideologies</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => navigateContent("prev")}
              disabled={currentContentIndex === 0}
              data-testid="button-prev-content"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {currentContent.type === 'chapter' ? 
                `Chapter ${currentContent.chapterNumber} of ${allChapters?.length || 0}` :
                `${currentContentIndex + 1} of ${totalContent}`
              }
            </div>
            
            <Button 
              onClick={() => navigateContent("next")}
              disabled={currentContentIndex === (totalContent - 1)}
              data-testid="button-next-content"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
