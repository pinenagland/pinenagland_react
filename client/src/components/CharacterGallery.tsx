import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, X, BookOpen, Eye, Crown, Sparkles } from "lucide-react";
import type { Deity } from "@shared/schema";

interface CharacterGalleryProps {
  onClose: () => void;
}

const partTitles: Record<string, string> = {
  "I": "The First Breath",
  "II": "The Divine Builders", 
  "III": "Serpents & Suns",
  "IV": "The Balance of Power",
  "V": "The Eternal Court",
  "VI": "Death and Rebirth",
  "VII": "The Flames of War"
};

const partDescriptions: Record<string, string> = {
  "I": "The primordial forces that first emerged from chaos to establish order",
  "II": "The creative deities who shaped the cosmos and built divine civilization",
  "III": "The powers of nature, the eternal struggle between order and chaos",
  "IV": "The gods who maintain cosmic balance and govern earthly affairs",
  "V": "The divine court that rules over wisdom, justice, and eternal principles",
  "VI": "The mysteries of death, rebirth, and the journey to the afterlife",
  "VII": "The warrior gods who defend cosmic order through divine conflict"
};

export default function CharacterGallery({ onClose }: CharacterGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeity, setSelectedDeity] = useState<Deity | null>(null);

  // Fetch all deities from the API
  const { data: deities = [], isLoading } = useQuery<Deity[]>({
    queryKey: ["/api/deities"]
  });

  // Group deities by part for organized display
  const deitiesByPart = deities.reduce((acc, deity) => {
    const part = deity.part;
    if (!acc[part]) {
      acc[part] = [];
    }
    acc[part].push(deity);
    return acc;
  }, {} as Record<string, Deity[]>);

  // Filter deities based on search term
  const filteredDeities = deities.filter(deity =>
    deity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (deity.domains as string[]).some(domain => 
      domain.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    (deity.tags as string[]).some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Group filtered deities by part
  const filteredDeitiesByPart = filteredDeities.reduce((acc, deity) => {
    const part = deity.part;
    if (!acc[part]) {
      acc[part] = [];
    }
    acc[part].push(deity);
    return acc;
  }, {} as Record<string, Deity[]>);

  const parts = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const displayParts = searchTerm ? 
    parts.filter(part => filteredDeitiesByPart[part]?.length > 0) : 
    parts.filter(part => deitiesByPart[part]?.length > 0);

  if (isLoading) {
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="max-w-6xl h-[80vh] bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-800 dark:text-amber-400">
              Character Gallery
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading the pantheon...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="max-w-6xl h-[80vh] bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <Crown className="h-6 w-6" />
              The Weavers of Eternity: Character Gallery
            </DialogTitle>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Explore the complete pantheon from Parts I-VII of the Egyptian Chronicles
            </p>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 h-full">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                data-testid="input-search-deities"
                placeholder="Search deities by name, domains, or attributes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
              />
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {searchTerm ? (
                <span>Found {filteredDeities.length} deities matching "{searchTerm}"</span>
              ) : (
                <span>Displaying {deities.length} deities across {displayParts.length} parts</span>
              )}
            </div>

            {/* Deities Grid organized by Parts */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-8">
                {displayParts.map((part) => {
                  const partDeities = searchTerm ? filteredDeitiesByPart[part] || [] : deitiesByPart[part] || [];
                  
                  if (partDeities.length === 0) return null;

                  return (
                    <div key={part} className="space-y-4">
                      {/* Part Header */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-3 mb-2">
                          <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300">
                            Part {part}: {partTitles[part]}
                          </h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {partDescriptions[part]}
                        </p>
                        <div className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                          {partDeities.length} {partDeities.length === 1 ? 'deity' : 'deities'}
                        </div>
                      </div>

                      {/* Deities Grid for this Part */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {partDeities.map((deity) => (
                          <Card 
                            key={deity.id} 
                            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-amber-100 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-600"
                            onClick={() => setSelectedDeity(deity)}
                            data-testid={`card-deity-${deity.id}`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg text-amber-800 dark:text-amber-300 leading-tight">
                                    {deity.name}
                                  </CardTitle>
                                  {deity.title && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                                      {deity.title}
                                    </p>
                                  )}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                  data-testid={`button-view-${deity.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {/* Description Preview */}
                                <p 
                                  className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3" 
                                  data-testid={`text-description-${deity.id}`}
                                >
                                  {deity.description}
                                </p>

                                {/* Domains */}
                                <div className="flex flex-wrap gap-1">
                                  {(deity.domains as string[]).slice(0, 3).map((domain, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="secondary" 
                                      className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                      data-testid={`badge-domain-${deity.id}-${index}`}
                                    >
                                      {domain}
                                    </Badge>
                                  ))}
                                  {(deity.domains as string[]).length > 3 && (
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs text-gray-500"
                                    >
                                      +{(deity.domains as string[]).length - 3} more
                                    </Badge>
                                  )}
                                </div>

                                {/* Chapter References */}
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <BookOpen className="h-3 w-3" />
                                  <span data-testid={`text-chapters-${deity.id}`}>
                                    {(deity.chapters as string[]).length} chapter{(deity.chapters as string[]).length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {displayParts.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No deities found matching your search criteria.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deity Detail Modal */}
      {selectedDeity && (
        <Dialog open={!!selectedDeity} onOpenChange={() => setSelectedDeity(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                    {selectedDeity.name}
                  </DialogTitle>
                  {selectedDeity.title && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 italic mt-1">
                      {selectedDeity.title}
                    </p>
                  )}
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                    Part {selectedDeity.part}: {partTitles[selectedDeity.part]}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedDeity(null)}
                  data-testid="button-close-deity-modal"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 pr-4">
                {/* Main Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Divine Nature</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedDeity.description}
                  </p>
                </div>

                {/* Domains */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Domains of Power</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedDeity.domains as string[]).map((domain, index) => (
                      <Badge 
                        key={index} 
                        className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      >
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Timeline and Era */}
                {(selectedDeity.timeSpan || selectedDeity.era) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      {selectedDeity.timeSpan && (
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Era:</span> {selectedDeity.timeSpan}
                        </p>
                      )}
                      {selectedDeity.era && (
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Period:</span> {selectedDeity.era}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Chapter References */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Appears In</h4>
                  <div className="space-y-2">
                    {(selectedDeity.chapters as string[]).map((chapterId, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded"
                      >
                        <BookOpen className="h-4 w-4 text-amber-500" />
                        <span className="font-mono">{chapterId}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {(selectedDeity.tags as string[]).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Related Concepts</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedDeity.tags as string[]).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline"
                          className="text-xs border-amber-200 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}