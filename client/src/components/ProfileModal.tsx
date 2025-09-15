import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  X, 
  BookOpen, 
  Target, 
  Lightbulb,
  Plus,
  Edit,
  Save,
  TrendingUp,
  User,
  Wind,
  Clock,
  Trophy,
  Calendar,
  Zap,
  Eye,
  Scale,
  Moon
} from "lucide-react";

interface ProfileModalProps {
  onClose: () => void;
}

interface UserGoal {
  category: string;
  description: string;
  progress: number;
  status: string;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { firebaseUser, dbUser, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newGoal, setNewGoal] = useState({ category: "", description: "" });
  const [preferences, setPreferences] = useState({
    readingGoal: dbUser?.preferences?.readingGoal || "",
    interests: dbUser?.preferences?.interests || "",
    notes: dbUser?.goals?.notes || ""
  });
  const queryClient = useQueryClient();

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!firebaseUser?.uid,
  });

  // Fetch practice sessions and stats
  const { data: practiceSessions } = useQuery({
    queryKey: ["/api/practice-sessions"],
    enabled: !!firebaseUser?.uid,
  });

  const { data: practiceStats } = useQuery({
    queryKey: ["/api/practice-stats"],
    enabled: !!firebaseUser?.uid,
  });

  if (!firebaseUser) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile & Goals</DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground py-8">
            Please sign in to access your profile and reading goals.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  const completedChapters = Array.isArray(userProgress) ? userProgress.filter((p: any) => p.completed)?.length : 0;
  const totalChapters = 72; // Based on our book structure

  const progressPercent = (completedChapters / totalChapters) * 100;

  // Practice statistics calculations
  const totalSessions = practiceStats?.totalSessions || 0;
  const totalPracticeTime = practiceStats?.totalDuration || 0; // in seconds
  const completedSessions = practiceStats?.completedSessions || 0;

  // Calculate streak (consecutive days with practice)
  const calculateStreak = () => {
    if (!Array.isArray(practiceSessions) || practiceSessions.length === 0) return 0;
    
    const sortedSessions = [...practiceSessions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  };

  const practiceStreak = calculateStreak();
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Get recent practice types
  const getRecentPracticeTypes = () => {
    if (!Array.isArray(practiceSessions)) return [];
    const recent = practiceSessions.slice(0, 10);
    const types = [...new Set(recent.map((s: any) => s.practiceType))];
    return types;
  };

  const practiceIcons = {
    meditation: Wind,
    yoga: Scale,
    breathing: Wind,
    mindfulness: Eye,
    sleep: Moon,
  };

  const updateUserMutation = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest("PATCH", `/api/users/${firebaseUser?.uid}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Profile updated",
        description: "Your preferences have been saved successfully."
      });
    }
  });

  const addGoalMutation = useMutation({
    mutationFn: async (goal: { category: string; description: string }) => {
      // In a real app, this would make an API call
      return Promise.resolve(goal);
    },
    onSuccess: () => {
      setNewGoal({ category: "", description: "" });
      // In a real app, invalidate queries to refetch user data
    }
  });

  const handleSavePreferences = () => {
    updateUserMutation.mutate({
      preferences: {
        readingGoal: preferences.readingGoal,
        interests: preferences.interests
      },
      goals: {
        notes: preferences.notes
      }
    });
  };

  const handleAddGoal = () => {
    if (newGoal.category && newGoal.description) {
      addGoalMutation.mutate(newGoal);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "on track": return "wellness";
      case "in progress": return "accent";
      case "active": return "primary";
      default: return "muted";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl floating-panel max-h-[90vh] overflow-y-auto">
        
        {/* Profile Header */}
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-serif">Profile & Personal Goals</CardTitle>
              <p className="text-muted-foreground">Track your journey and receive personalized recommendations</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="button-close-profile"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Profile Content */}
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Reading Progress */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Reading Journey
              </h4>
              
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {completedChapters} of {totalChapters} chapters
                      </span>
                    </div>
                    <Progress value={progressPercent} className="mb-2" />
                    <p className="text-xs text-muted-foreground">{Math.round(progressPercent)}% complete</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h5 className="font-medium mb-2">Current Chapter</h5>
                    <p className="text-sm text-muted-foreground">
                      Chapter {completedChapters + 1}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h5 className="font-medium mb-2">AI Conversations</h5>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-primary">0</p>
                      <TrendingUp className="w-4 h-4 text-wellness" />
                    </div>
                    <p className="text-xs text-muted-foreground">Questions answered this month</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Practice Statistics */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Wind className="w-5 h-5 text-purple-600" />
                Ancient Practices
              </h4>
              
              <div className="space-y-4">
                {/* Overall Practice Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium">Sessions</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">{totalSessions}</p>
                      <p className="text-xs text-muted-foreground">
                        {completedSessions} completed
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Total Time</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {formatDuration(totalPracticeTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Practice time accumulated
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Practice Streak */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">Current Streak</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span className="text-lg font-bold text-orange-600">
                          {practiceStreak}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {practiceStreak > 0 ? 
                        `${practiceStreak} consecutive day${practiceStreak > 1 ? 's' : ''} of practice` :
                        "Start a practice to begin your streak"
                      }
                    </p>
                  </CardContent>
                </Card>
                
                {/* Recent Practice Types */}
                {getRecentPracticeTypes().length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-medium mb-3">Recent Practices</h5>
                      <div className="flex gap-2 flex-wrap">
                        {getRecentPracticeTypes().map((type: string) => {
                          const Icon = practiceIcons[type as keyof typeof practiceIcons] || Wind;
                          return (
                            <div key={type} className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full">
                              <Icon className="w-3 h-3" />
                              <span className="text-xs capitalize">{type}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Practice Encouragement */}
                {totalSessions === 0 && (
                  <Card className="border-dashed border-purple-200">
                    <CardContent className="p-4 text-center">
                      <Wind className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <h5 className="font-medium text-purple-600 mb-1">Begin Your Practice Journey</h5>
                      <p className="text-xs text-muted-foreground mb-3">
                        Experience ancient Egyptian wisdom through meditation and movement
                      </p>
                      <Badge variant="outline" className="text-xs">
                        12 practices available
                      </Badge>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Personal Goals */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Personal Goals
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  data-testid="button-edit-goals"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {[].map((goal: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium">{goal.category}</h5>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`bg-${getStatusColor(goal.status)}/10 text-${getStatusColor(goal.status)} border-${getStatusColor(goal.status)}/20`}
                        >
                          {goal.status}
                        </Badge>
                      </div>
                      <Progress value={goal.progress} className="mb-1" />
                      <p className="text-xs text-muted-foreground">{goal.progress}% progress</p>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add New Goal */}
                {isEditing && (
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <Input
                          value={newGoal.category}
                          onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                          placeholder="Goal category (e.g., Health, Finance)"
                          data-testid="input-goal-category"
                        />
                        <Textarea
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          placeholder="Describe your goal..."
                          rows={2}
                          data-testid="input-goal-description"
                        />
                        <Button
                          onClick={handleAddGoal}
                          disabled={!newGoal.category || !newGoal.description}
                          className="w-full"
                          data-testid="button-add-goal"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Goal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

          </div>
          
          {/* AI Recommendations */}
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              AI-Powered Recommendations
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-wellness/5 border-wellness/20">
                <CardContent className="p-4">
                  <h5 className="font-medium text-wellness mb-2">Health & Wellness</h5>
                  <p className="text-sm mb-3 text-muted-foreground">
                    Based on your interest in ancient remedies, try the Egyptian "Lotus Breath" technique for better sleep.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-wellness hover:text-wellness/80 p-0 h-auto"
                    data-testid="button-health-recommendation"
                  >
                    Learn More →
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-4">
                  <h5 className="font-medium text-accent mb-2">Knowledge</h5>
                  <p className="text-sm mb-3 text-muted-foreground">
                    Your reading pattern suggests interest in divine kingship. Explore chapters on Mesopotamian rulers next.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-accent hover:text-accent/80 p-0 h-auto"
                    data-testid="button-knowledge-recommendation"
                  >
                    View Chapters →
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <h5 className="font-medium text-primary mb-2">Purpose</h5>
                  <p className="text-sm mb-3 text-muted-foreground">
                    Consider journaling about leadership principles from ancient civilizations to clarify your personal mission.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-primary hover:text-primary/80 p-0 h-auto"
                    data-testid="button-purpose-recommendation"
                  >
                    Start Journal →
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>

      </Card>
    </div>
  );
}
