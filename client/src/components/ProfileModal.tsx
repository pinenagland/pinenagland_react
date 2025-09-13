import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { 
  X, 
  BookOpen, 
  Target, 
  Lightbulb,
  Plus,
  Edit,
  Save,
  TrendingUp
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
  const [isEditing, setIsEditing] = useState(false);
  const [newGoal, setNewGoal] = useState({ category: "", description: "" });
  const queryClient = useQueryClient();

  // Mock user data - in a real app this would come from authentication
  const mockUserData = {
    id: "user_123",
    name: "Syed",
    email: "syed@example.com",
    readingProgress: {
      chaptersRead: 14,
      totalChapters: 50,
      currentChapter: "Chapter 41: Horus – The Falcon God of Kingship"
    },
    goals: [
      {
        category: "Lifestyle",
        description: "Improve sleep quality and energy",
        progress: 75,
        status: "On Track"
      },
      {
        category: "Finance", 
        description: "Save $2000 for travel",
        progress: 50,
        status: "In Progress"
      },
      {
        category: "Relationships",
        description: "Better communication skills", 
        progress: 67,
        status: "Active"
      }
    ] as UserGoal[],
    aiConversations: 247,
    meditationSessions: 12
  };

  const progressPercent = (mockUserData.readingProgress.chaptersRead / mockUserData.readingProgress.totalChapters) * 100;

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
                        {mockUserData.readingProgress.chaptersRead} of {mockUserData.readingProgress.totalChapters} chapters
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
                      {mockUserData.readingProgress.currentChapter}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h5 className="font-medium mb-2">AI Conversations</h5>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-primary">{mockUserData.aiConversations}</p>
                      <TrendingUp className="w-4 h-4 text-wellness" />
                    </div>
                    <p className="text-xs text-muted-foreground">Questions answered this month</p>
                  </CardContent>
                </Card>
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
                {mockUserData.goals.map((goal, index) => (
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
