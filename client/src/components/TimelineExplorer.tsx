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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { X, Search, Clock, MapPin, Filter, Calendar } from "lucide-react";
import type { HistoryEvent } from "@shared/schema";

// Helper function to get auth headers for fetch
async function getAuthHeaders(): Promise<Record<string, string>> {
  // Simple implementation for now - can be enhanced later with auth
  return {};
}

interface TimelineExplorerProps {
  onClose: () => void;
}

export default function TimelineExplorer({ onClose }: TimelineExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("chronological");
  const [timelineView, setTimelineView] = useState<"list" | "visual">("list");
  const [yearRange, setYearRange] = useState<{ start: string; end: string }>({
    start: "",
    end: ""
  });

  const { data: events, isLoading } = useQuery<HistoryEvent[]>({
    queryKey: ["/api/history/events", { 
      era: selectedEra && selectedEra !== "all" ? selectedEra : undefined,
      tags: selectedRegion && selectedRegion !== "all" ? selectedRegion : undefined 
    }],
    queryFn: async ({ queryKey }) => {
      const [url, params] = queryKey;
      const searchParams = new URLSearchParams();
      
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }
      
      const fullUrl = searchParams.toString() 
        ? `${url}?${searchParams.toString()}`
        : url as string;
      
      const headers = await getAuthHeaders();
      const res = await fetch(fullUrl, {
        headers,
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    }
  });

  let filteredEvents = events?.filter(event => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.tags as string[])?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = selectedCategory === "" || selectedCategory === "all" ||
      (event.tags as string[])?.includes(selectedCategory);
    
    // Year range filter
    const matchesYearRange = (!yearRange.start || event.year >= parseInt(yearRange.start)) &&
                           (!yearRange.end || event.year <= parseInt(yearRange.end));
    
    return matchesSearch && matchesCategory && matchesYearRange;
  }) || [];

  // Sort events
  if (sortBy === "chronological") {
    filteredEvents = filteredEvents.sort((a, b) => a.year - b.year);
  } else if (sortBy === "reverse-chronological") {
    filteredEvents = filteredEvents.sort((a, b) => b.year - a.year);
  } else if (sortBy === "alphabetical") {
    filteredEvents = filteredEvents.sort((a, b) => a.title.localeCompare(b.title));
  }

  const eras = [
    "Prehistoric", "Predynastic", "Early Dynastic", "Old Kingdom", 
    "Middle Kingdom", "New Kingdom", "Classical Period", "Roman Period", 
    "Medieval", "Early Modern", "Modern Era", "Mythological"
  ];
  const regions = ["Egypt", "Global", "Mediterranean", "Nile Valley", "Mesopotamia"];
  const categories = [
    "Political", "Architecture", "Religion", "Cultural", "Archaeological", 
    "Engineering", "Mythology", "Discovery", "Writing", "Military", "Urban Planning"
  ];
  const sortOptions = [
    { value: "chronological", label: "Oldest First" },
    { value: "reverse-chronological", label: "Newest First" },
    { value: "alphabetical", label: "A-Z" }
  ];

  const formatYear = (year: number) => {
    if (year < 0) {
      return `${Math.abs(year)} BCE`;
    }
    return `${year} CE`;
  };

  const getEraColor = (era: string) => {
    const colors: Record<string, string> = {
      "Prehistoric": "bg-stone-100 text-stone-700 border-stone-300",
      "Predynastic": "bg-amber-100 text-amber-700 border-amber-300",
      "Early Dynastic": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "Old Kingdom": "bg-orange-100 text-orange-700 border-orange-300",
      "Middle Kingdom": "bg-red-100 text-red-700 border-red-300",
      "New Kingdom": "bg-purple-100 text-purple-700 border-purple-300",
      "Classical Period": "bg-blue-100 text-blue-700 border-blue-300",
      "Roman Period": "bg-indigo-100 text-indigo-700 border-indigo-300",
      "Medieval": "bg-green-100 text-green-700 border-green-300",
      "Early Modern": "bg-teal-100 text-teal-700 border-teal-300",
      "Modern Era": "bg-slate-100 text-slate-700 border-slate-300",
      "Mythological": "bg-violet-100 text-violet-700 border-violet-300"
    };
    return colors[era] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[600px] flex flex-col floating-panel">
        
        {/* Timeline Header */}
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline Explorer
              </CardTitle>
              <p className="text-muted-foreground">Navigate through {filteredEvents.length} historical events</p>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={timelineView} onValueChange={(v) => setTimelineView(v as "list" | "visual")} className="mr-4">
                <TabsList className="grid w-full grid-cols-2" data-testid="tabs-timeline-view">
                  <TabsTrigger value="list" data-testid="tab-list-view">List</TabsTrigger>
                  <TabsTrigger value="visual" data-testid="tab-visual-view">Timeline</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                data-testid="button-close-timeline"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          <div className="space-y-4 mt-4">
            <div className="flex gap-3 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={selectedEra} onValueChange={setSelectedEra}>
                <SelectTrigger className="w-40" data-testid="select-era">
                  <SelectValue placeholder="All Eras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Eras</SelectItem>
                  {eras.map(era => (
                    <SelectItem key={era} value={era}>{era}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-36" data-testid="select-region">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-36" data-testid="select-category">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Year Range:</span>
              </div>
              <Input
                type="number"
                placeholder="From (e.g., -3000)"
                value={yearRange.start}
                onChange={(e) => setYearRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-36"
                data-testid="input-year-start"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="To (e.g., 2000)"
                value={yearRange.end}
                onChange={(e) => setYearRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-36"
                data-testid="input-year-end"
              />
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, descriptions, tags..."
                  className="pl-10"
                  data-testid="input-timeline-search"
                />
              </div>
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
              <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No events found for the selected criteria.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <Tabs value={timelineView} className="h-full">
              <TabsContent value="list" className="mt-0 space-y-6">
                {filteredEvents.map((event, index) => (
                  <div key={event.id} className="timeline-item relative">
                    <div className="flex gap-6">
                      {/* Timeline marker */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-accent border-2 border-background shadow-sm" />
                        {index < filteredEvents.length - 1 && (
                          <div className="w-0.5 h-16 bg-border mt-2" />
                        )}
                      </div>
                      
                      {/* Event content */}
                      <div className="flex-1 pb-6">
                        <div className="flex justify-between items-start gap-6 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-lg">{event.title}</h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getEraColor(event.era)}`}
                              >
                                {event.era}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {event.description}
                            </p>
                            <div className="flex gap-2 flex-wrap items-center">
                              {event.region && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>{event.region}</span>
                                </div>
                              )}
                              {(event.tags as string[])?.map((tag, tagIndex) => (
                                <Badge 
                                  key={tagIndex} 
                                  variant="outline" 
                                  className="bg-accent/10 text-accent border-accent/20 text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-mono text-accent font-bold text-xl">
                              {formatYear(event.year)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Era separator */}
                    {index < filteredEvents.length - 1 && 
                     filteredEvents[index + 1] && 
                     event.era !== filteredEvents[index + 1].era && (
                      <div className="my-8">
                        <Separator className="my-4" />
                        <div className="text-center">
                          <Badge variant="outline" className="bg-background px-3 py-1">
                            Entering {filteredEvents[index + 1].era}
                          </Badge>
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="visual" className="mt-0">
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Visual Timeline View</p>
                  <p className="text-sm text-muted-foreground mt-2">Coming soon - Interactive visual timeline representation</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>

      </Card>
    </div>
  );
}
