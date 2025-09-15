import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Bot, 
  User, 
  Send, 
  Minimize2, 
  CheckCircle, 
  Brain, 
  Scroll
} from "lucide-react";
import devanAvatraLogo from "@/assets/devan-avatra-logo.jpg";

interface AIAssistantProps {
  chapterId: string | null;
  standalone?: boolean;
}

interface AIResponse {
  content: string;
  agents: {
    factChecker?: any;
    reasoner?: any;
    narrator?: any;
  };
  queryType: string;
  agentsUsed: string[];
}

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  agents?: any;
}

export default function AIAssistant({ chapterId, standalone = false }: AIAssistantProps) {
  const { firebaseUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Welcome! I'm Devan Avatra, your guide through The Weavers of Eternity. I can help you explore the chronicle of Egyptian gods, fact-check mythological details, and reveal the deeper meanings within these ancient stories. What aspect of the divine tapestry would you like to explore?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const aiQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/ai/query", {
        query,
        chapterId,
        userId: firebaseUser?.uid,
      });
      return response.json() as Promise<AIResponse>;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: "ai",
        content: data.content,
        agents: data.agents,
        timestamp: new Date(),
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        role: "ai",
        content: "I'm currently experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    }
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim() || aiQueryMutation.isPending) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    aiQueryMutation.mutate(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Tell me about Nu, the infinite waters",
    "How do Kek and Heh create cosmic balance?",
    "What is the significance of Amun being hidden?",
    "How does Mut embody divine motherhood?",
    "Explain the rise of Tatenen from the waters",
    "What role does Khonsu play as timekeeper?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMinimized && !standalone) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-12 h-12 gradient-accent"
          data-testid="button-expand-ai"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`${standalone ? 'w-full max-w-4xl mx-auto' : 'w-96'} bg-card border-l border-border flex flex-col`}>
      
      {/* AI Assistant Header */}
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
            <img src={devanAvatraLogo} alt="Devan Avatra" className="w-8 h-8 object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Devan Avatra</h3>
            <p className="text-xs text-muted-foreground">AI Assistance</p>
          </div>
          {!standalone && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              data-testid="button-minimize-ai"
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        {/* Agent Status Indicators */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <Badge variant="outline" className="bg-wellness/10 text-wellness border-wellness/20">
            <div className="w-2 h-2 bg-wellness rounded-full mr-1"></div>
            Fact-Checker
          </Badge>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            <div className="w-2 h-2 bg-accent rounded-full mr-1"></div>
            Reasoner
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <div className="w-2 h-2 bg-primary rounded-full mr-1"></div>
            Narrator
          </Badge>
        </div>
      </CardHeader>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
            {message.role === "ai" && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                <img src={devanAvatraLogo} alt="Devan Avatra" className="w-8 h-8 object-cover" />
              </div>
            )}
            
            <div className={`flex-1 ${message.role === "user" ? "max-w-xs" : ""}`}>
              <div className={`p-3 rounded-lg ${
                message.role === "user" 
                  ? "bg-primary text-primary-foreground ml-auto" 
                  : "bg-muted"
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>
              
              {/* Agent breakdown for AI responses */}
              {message.role === "ai" && message.agents && (
                <div className="mt-2 space-y-2">
                  {message.agents.factChecker && (
                    <div className="text-xs">
                      <div className="flex items-center gap-1 text-wellness font-medium mb-1">
                        <CheckCircle className="w-3 h-3" />
                        Fact-Checker Results
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Confidence: {message.agents.factChecker.confidence_level || "medium"}
                      </p>
                    </div>
                  )}
                  
                  {message.agents.reasoner && (
                    <div className="text-xs">
                      <div className="flex items-center gap-1 text-accent font-medium mb-1">
                        <Brain className="w-3 h-3" />
                        Reasoning Analysis
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {message.agents.reasoner.key_concepts?.slice(0, 2).join(", ") || "Analyzed"}
                      </p>
                    </div>
                  )}
                  
                  {message.agents.narrator && (
                    <div className="text-xs">
                      <div className="flex items-center gap-1 text-primary font-medium mb-1">
                        <Scroll className="w-3 h-3" />
                        Narrative Context
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {message.agents.narrator.modern_relevance?.slice(0, 50) || "Contextual narrative"}...
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
                {message.role === "ai" ? "Devan Avatra Response" : message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
        
        {aiQueryMutation.isPending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src={devanAvatraLogo} alt="Devan Avatra" className="w-8 h-8 object-cover" />
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                <span className="text-sm">Devan Avatra is analyzing your query...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {!standalone && (
        <div className="border-t border-border pt-4 px-4">
          <h4 className="text-sm font-medium mb-2">Quick Questions</h4>
          <div className="space-y-2">
            {quickQuestions.slice(0, 3).map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full text-left text-xs p-2 h-auto bg-secondary/50 hover:bg-secondary justify-start"
                onClick={() => {
                  setInputValue(question);
                  handleSendMessage();
                }}
                data-testid={`button-quick-question-${index}`}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${chapterId ? 'this chapter' : 'Egyptian gods'}, mythology, or the divine chronicles...`}
            className="flex-1"
            disabled={aiQueryMutation.isPending}
            data-testid="input-ai-chat"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || aiQueryMutation.isPending}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send • Devan Avatra will analyze your question
        </p>
      </div>
    </div>
  );
}
