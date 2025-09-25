import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
  Maximize2
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { BookChapter } from "@shared/schema";

interface BookReaderProps {
  chapterId: string;
  onChapterChange: (chapterId: string) => void;
}

export default function BookReader({ chapterId, onChapterChange }: BookReaderProps) {
  const [fontSize, setFontSize] = useState("text-lg");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  
  const getFontSizeClass = () => {
    switch (fontSize) {
      case "text-sm": return "text-sm";
      case "text-lg": return "text-lg";
      case "text-xl": return "text-xl";
      default: return "text-lg";
    }
  };

  const { data: chapter, isLoading } = useQuery<BookChapter>({
    queryKey: ["/api/chapters", chapterId],
  });

  const { data: allChapters } = useQuery<BookChapter[]>({
    queryKey: ["/api/chapters"],
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Chapter not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentIndex = allChapters?.findIndex(ch => ch.id === chapterId) ?? 0;
  const totalChapters = allChapters?.length ?? 50;
  const progressPercent = ((currentIndex + 1) / totalChapters) * 100;

  const navigateChapter = (direction: "prev" | "next") => {
    if (!allChapters) return;
    
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < allChapters.length) {
      onChapterChange(allChapters[newIndex].id);
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
          )}>{chapter.title}</h2>
          {chapter.era && (
            <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">
              {chapter.era}
            </Badge>
          )}
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
          
          {/* Chapter Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-accent font-mono text-sm">CH.{chapter.chapterNumber}</span>
              <div className="flex-1 h-px bg-border"></div>
              {chapter.timeSpan && (
                <span className="text-muted-foreground text-sm">{String(chapter.timeSpan)}</span>
              )}
            </div>
            <h1 className="font-serif text-4xl font-semibold mb-4">{chapter.title}</h1>
            {chapter.commentary && (
              <p className="text-muted-foreground text-lg leading-relaxed">{String(chapter.commentary)}</p>
            )}
          </div>

          {/* Chapter Illustration */}
          {chapter.figures && (chapter.figures as string[]).length > 0 && (
            <div className="mb-8">
              <img 
                src={(chapter.figures as string[])[0]} 
                alt={`Illustration for ${chapter.title}`}
                className="w-full h-64 object-cover rounded-lg shadow-lg" 
              />
              <p className="text-center text-sm text-muted-foreground mt-2">
                Historical illustration related to {chapter.title}
              </p>
            </div>
          )}

          {/* Book Content */}
          <div className={`prose max-w-none font-serif leading-relaxed ${getFontSizeClass()}`}>
            <div className="first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-accent first-letter:mr-2 first-letter:float-left first-letter:leading-none">
              {chapter.narrative.split('\n\n').map((paragraph: string, index: number) => (
                <p key={index} className={index === 0 ? "" : "mt-4"}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Historical Context Cards */}
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
                    <span className="font-medium">{chapter.timeSpan || "Ancient History"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Era:</span>
                    <span className="font-medium">{chapter.era}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Tags:</span>
                    <div className="flex gap-1 flex-wrap">
                      {(chapter.tags as string[])?.map((tag, index) => (
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

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => navigateChapter("prev")}
              disabled={currentIndex === 0}
              data-testid="button-prev-chapter"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous Chapter
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Chapter {chapter.chapterNumber} of {totalChapters}
            </div>
            
            <Button 
              onClick={() => navigateChapter("next")}
              disabled={currentIndex === (totalChapters - 1)}
              data-testid="button-next-chapter"
            >
              Next Chapter
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
