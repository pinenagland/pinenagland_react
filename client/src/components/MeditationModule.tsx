import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  Play, 
  Pause, 
  Wind, 
  Eye, 
  Scale, 
  Moon,
  Clock
} from "lucide-react";
import type { Practice } from "@shared/schema";

interface MeditationModuleProps {
  onClose: () => void;
}

export default function MeditationModule({ onClose }: MeditationModuleProps) {
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const { data: practices, isLoading } = useQuery<Practice[]>({
    queryKey: ["/api/practices"],
  });

  const practiceIcons = {
    meditation: Wind,
    yoga: Scale,
    breathing: Wind,
    mindfulness: Eye,
    sleep: Moon,
  };

  const practiceColors = {
    meditation: "wellness",
    yoga: "accent", 
    breathing: "primary",
    mindfulness: "primary",
    sleep: "muted",
  };

  const startPractice = (practice: Practice) => {
    setSelectedPractice(practice);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedPractice) {
    const progress = selectedPractice.duration > 0 ? (currentTime / (selectedPractice.duration * 60)) * 100 : 0;
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl floating-panel">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-serif">{selectedPractice.title}</CardTitle>
                <p className="text-muted-foreground">{selectedPractice.origin}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedPractice(null);
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                data-testid="button-close-practice"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Practice Timer */}
            <div className="text-center mb-8">
              <div className="text-6xl font-mono font-light mb-4 text-accent">
                {formatTime(currentTime)}
              </div>
              <Progress value={progress} className="w-full mb-4" />
              <p className="text-sm text-muted-foreground">
                {formatTime(selectedPractice.duration * 60)} total duration
              </p>
            </div>

            {/* Practice Instructions */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Instructions</h3>
              <div className="prose prose-sm max-w-none">
                {selectedPractice.instructions.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={togglePlayPause}
                className="px-8"
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isPlaying ? "Pause" : "Start"}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSelectedPractice(null);
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                data-testid="button-end-practice"
              >
                End Practice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl floating-panel">
        
        {/* Meditation Header */}
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-serif">Ancient Wisdom Practices</CardTitle>
              <p className="text-muted-foreground">Meditation & yoga rooted in Nile Valley traditions</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="button-close-meditation"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Practice Selection */}
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading practices...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {practices?.map((practice) => {
                const Icon = practiceIcons[practice.type as keyof typeof practiceIcons] || Wind;
                const colorClass = practiceColors[practice.type as keyof typeof practiceColors] || "primary";
                
                return (
                  <Card 
                    key={practice.id}
                    className={`bg-${colorClass}/5 border-${colorClass}/20 hover:bg-${colorClass}/10 transition-colors cursor-pointer`}
                    onClick={() => startPractice(practice)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 bg-${colorClass}/20 rounded-full flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${colorClass}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{practice.title}</h4>
                          <p className="text-sm text-muted-foreground">{practice.origin}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3 text-muted-foreground">
                        {practice.instructions.slice(0, 120)}...
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{practice.duration} minutes</span>
                        </div>
                        <Button 
                          size="sm" 
                          className={`bg-${colorClass} text-white hover:bg-${colorClass}/90`}
                          data-testid={`button-start-${practice.id}`}
                        >
                          Start Practice
                        </Button>
                      </div>
                      
                      {practice.tags && (practice.tags as string[]).length > 0 && (
                        <div className="flex gap-1 mt-3 flex-wrap">
                          {(practice.tags as string[]).slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

            </div>
          )}
        </CardContent>

      </Card>
    </div>
  );
}
