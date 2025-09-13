import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { X, Search } from "lucide-react";
import type { HistoryEvent } from "@shared/schema";

interface TimelineExplorerProps {
  onClose: () => void;
}

export default function TimelineExplorer({ onClose }: TimelineExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const { data: events, isLoading } = useQuery<HistoryEvent[]>({
    queryKey: ["/api/history/events", { 
      era: selectedEra || undefined,
      tags: selectedRegion ? [selectedRegion] : undefined 
    }],
  });

  const filteredEvents = events?.filter(event => 
    searchQuery === "" || 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const eras = ["Ancient History", "Classical Period", "Medieval", "Modern Era", "Prehistoric"];
  const regions = ["Egypt", "Global", "Mediterranean", "Nile Valley", "Mesopotamia"];

  const formatYear = (year: number) => {
    if (year < 0) {
      return `${Math.abs(year)} BCE`;
    }
    return `${year} CE`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[600px] flex flex-col floating-panel">
        
        {/* Timeline Header */}
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-serif">Timeline Explorer</CardTitle>
              <p className="text-muted-foreground">Navigate through 4.5 billion years of history</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="button-close-timeline"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Timeline Filters */}
          <div className="flex gap-4 mt-4">
            <Select value={selectedEra} onValueChange={setSelectedEra}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Eras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Eras</SelectItem>
                {eras.map(era => (
                  <SelectItem key={era} value={era}>{era}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="pl-10"
                data-testid="input-timeline-search"
              />
            </div>
          </div>
        </CardHeader>

        {/* Timeline Content */}
        <CardContent className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading historical events...</p>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events found for the selected criteria.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="timeline-item">
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg mb-2">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {event.description}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {(event.tags as string[])?.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="bg-accent/10 text-accent border-accent/20"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono text-accent font-medium text-lg">
                        {formatYear(event.year)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{event.era}</p>
                      {event.region && (
                        <p className="text-xs text-muted-foreground">{event.region}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

      </Card>
    </div>
  );
}
