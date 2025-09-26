import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  X, 
  Play, 
  Pause, 
  Wind, 
  Eye, 
  Scale, 
  Moon,
  Clock,
  CheckCircle,
  RotateCcw,
  Trophy,
  Zap
} from "lucide-react";
import type { Practice } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MeditationModuleProps {
  onClose: () => void;
}

export default function MeditationModule({ onClose }: MeditationModuleProps) {
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [sessionSaved, setSessionSaved] = useState(false);
  
  const { dbUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: practices, isLoading } = useQuery<Practice[]>({
    queryKey: ["/api/practices"],
  });

  // Create practice session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest('POST', '/api/practice-sessions', sessionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/practice-sessions'] });
    }
  });

  // Save practice progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (progressData: any) => {
      const response = await apiRequest('POST', '/api/progress', progressData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    }
  });

  const practiceIcons = {
    meditation: Wind,
    yoga: Scale,
    breathing: Wind,
    mindfulness: Eye,
    sleep: Moon,
  };

  const practiceColors = {
    meditation: "blue",
    yoga: "green", 
    breathing: "purple",
    mindfulness: "amber",
    sleep: "indigo",
  };

  const getDifficultyLevel = (duration: number) => {
    if (duration <= 8) return { level: 'Beginner', color: 'green', description: 'Perfect for newcomers' };
    if (duration <= 15) return { level: 'Intermediate', color: 'amber', description: 'Building your practice' };
    return { level: 'Advanced', color: 'red', description: 'For experienced practitioners' };
  };

  const getPracticeTypeDescription = (type: string) => {
    const descriptions = {
      meditation: 'Mindful contemplation and inner journey',
      yoga: 'Physical movement and spiritual alignment', 
      breathing: 'Focused breathwork and energy cultivation',
      mindfulness: 'Present-moment awareness practice',
      sleep: 'Restful preparation and dream work'
    };
    return descriptions[type as keyof typeof descriptions] || 'Ancient wisdom practice';
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && selectedPractice && !isCompleted) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          // Check if practice is completed
          if (newTime >= selectedPractice.duration * 60) {
            setIsPlaying(false);
            setIsCompleted(true);
            handlePracticeCompletion(selectedPractice, newTime);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, selectedPractice, isCompleted]);

  const handlePracticeCompletion = useCallback(async (practice: Practice, timeSpent: number) => {
    if (!dbUser || sessionSaved) return; // Prevent duplicate saves

    try {
      setSessionSaved(true); // Mark as saved to prevent duplicates
      
      // Save practice session - server will set userId and timestamp
      const sessionData = {
        practiceId: practice.id,
        duration: timeSpent,
        completed: timeSpent >= practice.duration * 60,
        practiceType: practice.type,
      };
      
      await createSessionMutation.mutateAsync(sessionData);
      
      // Save progress if completed - using a practice-specific chapter ID
      if (timeSpent >= practice.duration * 60) {
        await saveProgressMutation.mutateAsync({
          chapterId: `practice-${practice.id}`,
          completed: true,
          progressPercent: 100
        });
        
        toast({
          title: "Practice Completed! 🧘‍♀️",
          description: `You've completed ${practice.title}. Well done on your spiritual journey.`,
        });
      }
    } catch (error) {
      console.error('Failed to save practice session:', error);
      setSessionSaved(false); // Reset flag on error so user can retry
      toast({
        title: "Session saved locally",
        description: "Your practice was completed but couldn't be synced.",
        variant: "destructive"
      });
    }
  }, [dbUser, sessionSaved, createSessionMutation, saveProgressMutation, toast]);

  const startPractice = (practice: Practice) => {
    setSelectedPractice(practice);
    setCurrentTime(0);
    setIsPlaying(true);
    setIsCompleted(false);
    setSessionSaved(false); // Reset session saved flag
    setStartTime(new Date());
    setSessionData({
      practiceId: practice.id,
      startTime: new Date()
    });
  };

  const togglePlayPause = () => {
    if (isCompleted) return;
    setIsPlaying(!isPlaying);
  };

  const resetPractice = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setIsCompleted(false);
    setSessionSaved(false); // Reset session saved flag
    setStartTime(new Date());
  };

  const endPractice = () => {
    if (selectedPractice && currentTime > 30 && !sessionSaved) { // Save if practiced for more than 30 seconds and not already saved
      handlePracticeCompletion(selectedPractice, currentTime);
    }
    setSelectedPractice(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setIsCompleted(false);
    setSessionSaved(false); // Reset session saved flag
    setStartTime(null);
    setSessionData(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedPractice) {
    const progress = selectedPractice.duration > 0 ? (currentTime / (selectedPractice.duration * 60)) * 100 : 0;
    
    return (
      <Dialog open={true} onOpenChange={(open) => !open && endPractice()}>
        <DialogContent className="w-full max-w-2xl p-0">
          <Card className="w-full border-0">
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
                  // Same behavior as endPractice but without saving
                  setSelectedPractice(null);
                  setIsPlaying(false);
                  setCurrentTime(0);
                  setIsCompleted(false);
                  setSessionSaved(false);
                  setStartTime(null);
                  setSessionData(null);
                }}
                data-testid="button-close-practice"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Practice Timer with Ambient Visual */}
            <div className="text-center mb-8 relative">
              {/* Ambient breathing animation */}
              <div className={`absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 ${isPlaying ? 'animate-pulse' : ''} transition-all duration-1000`} />
              
              <div className="relative z-10">
                <div className={`text-6xl font-mono font-light mb-4 transition-colors duration-300 ${
                  isCompleted ? 'text-green-500' : isPlaying ? 'text-accent' : 'text-muted-foreground'
                }`}>
                  {formatTime(currentTime)}
                </div>
                
                <div className="mb-4">
                  <Progress 
                    value={progress} 
                    className={`w-full h-2 transition-all duration-300 ${
                      isCompleted ? '[&>div]:bg-green-500' : '[&>div]:bg-accent'
                    }`} 
                  />
                  <div className={`w-full h-1 mt-1 rounded-full bg-gradient-to-r opacity-30 ${
                    isPlaying ? 'from-accent/20 via-accent/40 to-accent/20 animate-pulse' : 'from-transparent to-transparent'
                  }`} />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{formatTime(selectedPractice.duration * 60)} total</span>
                  <span className={`font-medium transition-colors ${
                    isCompleted ? 'text-green-500' : 'text-accent'
                  }`}>
                    {isCompleted ? 'Practice Complete! ✨' : 
                     isPlaying ? 'Practicing...' : 
                     `${Math.round(progress)}% complete`}
                  </span>
                </div>
              </div>
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

            {/* Completion Celebration */}
            {isCompleted && (
              <div className="text-center mb-6 p-6 bg-green-500/10 rounded-lg border border-green-500/20">
                <Trophy className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-green-500 mb-2">Practice Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  You've completed {selectedPractice.title}. May the ancient wisdom guide your spirit.
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isCompleted ? (
                <>
                  <Button
                    size="lg"
                    onClick={togglePlayPause}
                    className="px-8"
                    data-testid="button-play-pause"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                    {isPlaying ? "Pause" : (currentTime > 0 ? "Resume" : "Start")}
                  </Button>
                  
                  {currentTime > 0 && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={resetPractice}
                      data-testid="button-reset-practice"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={() => {
                    setIsCompleted(false);
                    setSessionSaved(false); // Allow new session to be saved
                    resetPractice();
                  }}
                  className="px-8"
                  data-testid="button-practice-again"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Practice Again
                </Button>
              )}
              
              <Button
                variant="outline"
                size="lg"
                onClick={endPractice}
                data-testid="button-end-practice"
              >
                End Session
              </Button>
            </div>
          </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-2xl max-h-[95vh] flex flex-col p-0">
        <Card className="w-full h-full flex flex-col border-0">
        
        {/* Meditation Header */}
        <CardHeader className="border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-serif">Ancient Wisdom Practices</CardTitle>
              <p className="text-sm text-muted-foreground">Meditation & yoga rooted in Nile Valley traditions</p>
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
        <CardContent className="p-4 sm:p-6 flex-1 overflow-y-auto overscroll-y-contain">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading practices...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              {practices?.map((practice) => {
                const Icon = practiceIcons[practice.type as keyof typeof practiceIcons] || Wind;
                const colorClass = practiceColors[practice.type as keyof typeof practiceColors] || "primary";
                
                const difficulty = getDifficultyLevel(practice.duration);
                const typeDescription = getPracticeTypeDescription(practice.type);
                
                return (
                  <Card 
                    key={practice.id}
                    className={`relative overflow-hidden bg-gradient-to-br from-${colorClass}-500/5 to-${colorClass}-600/10 border-${colorClass}/20 hover:from-${colorClass}-500/10 hover:to-${colorClass}-600/15 transition-all duration-300 cursor-pointer group hover:shadow-lg`}
                    onClick={() => startPractice(practice)}
                    data-testid={`card-practice-${practice.id}`}
                  >
                    <CardContent className="p-5">
                      {/* Ambient background pattern */}
                      <div className={`absolute inset-0 opacity-5 bg-gradient-to-br from-${colorClass}-500/20 to-transparent`} />
                      
                      <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br from-${colorClass}-500/20 to-${colorClass}-600/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform`}>
                            <Icon className={`w-6 h-6 text-${colorClass}-600`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">{practice.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{typeDescription}</p>
                            <p className="text-xs text-muted-foreground/80">{practice.origin}</p>
                          </div>
                        </div>
                      
                        <p className="text-sm mb-4 text-muted-foreground leading-relaxed">
                          {practice.instructions.slice(0, 140)}...
                        </p>
                        
                        {/* Difficulty and Duration */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{practice.duration} min</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs border-${difficulty.color || 'green'}-300 text-${difficulty.color || 'green'}-600 bg-${difficulty.color || 'green'}-50`}
                            >
                              {difficulty?.level || 'Beginner'}
                            </Badge>
                          </div>
                          
                          <Button 
                            size="sm" 
                            className={`bg-gradient-to-r from-${colorClass}-500 to-${colorClass}-600 text-white hover:from-${colorClass}-600 hover:to-${colorClass}-700 transition-all shadow-md`}
                            data-testid={`button-start-${practice.id}`}
                          >
                            Begin Journey
                          </Button>
                        </div>
                        
                        {practice.tags && Array.isArray(practice.tags) && practice.tags.length > 0 && (
                          <div className="flex gap-1.5 mt-3 flex-wrap">
                            {(practice.tags as string[]).slice(0, 4).map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs font-normal">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

            </div>
          )}
        </CardContent>

        </Card>
      </DialogContent>
    </Dialog>
  );
}
