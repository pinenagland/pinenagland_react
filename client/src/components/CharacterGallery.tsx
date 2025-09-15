import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, BookOpen, Eye } from "lucide-react";
import type { BookChapter } from "@shared/schema";

interface CharacterGalleryProps {
  onClose: () => void;
}

interface Character {
  name: string;
  description: string;
  chapters: string[];
  domains: string[];
  image?: string;
}

export default function CharacterGallery({ onClose }: CharacterGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const { data: chapters, isLoading } = useQuery<BookChapter[]>({
    queryKey: ["/api/chapters"]
  });

  // Extract characters from the book chapters
  const extractCharacters = (chapters: BookChapter[]): Character[] => {
    const characters: Character[] = [
      {
        name: "Nu",
        description: "The primordial waters of creation, the infinite sea from which all existence emerged. Nu is not a god in the traditional sense, but rather the canvas upon which existence was painted - the dark water, the eternal tide, the father of beginnings and the grave of endings.",
        chapters: ["prologue", "ch_1"],
        domains: ["Primordial Waters", "Creation", "Infinity", "Source of All"],
        image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000"
      },
      {
        name: "Kek",
        description: "The god of darkness and shadow, cloaked in eternal dusk that lingers before dawn. Kek represents the veil, the silence before the cry, and provides the necessary darkness that gives light meaning and offers rest to order.",
        chapters: ["ch_1", "ch_2"],
        domains: ["Darkness", "Shadow", "Night", "Balance"],
        image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78"
      },
      {
        name: "Heh",
        description: "The god of infinity and endless expanse, stretching in every direction without boundary. Heh multiplies time and grants it no end, representing the forever upon which the fleeting stands.",
        chapters: ["ch_1", "ch_2"],
        domains: ["Infinity", "Time", "Eternity", "Endless Expanse"],
        image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78"
      },
      {
        name: "Amun",
        description: "The Hidden One, the mysterious and unknowable presence that slips through grasp and gaze. Amun is the unseen force that moves through what is, what was, and what will be. His true form cannot be named, for it is in being hidden that he endures.",
        chapters: ["ch_1", "ch_3"],
        domains: ["Mystery", "Hidden Force", "The Unknown", "Divine Concealment"],
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
      },
      {
        name: "Mut",
        description: "The Great Mother, vast yet gentle, whose presence is radiant and whose embrace is wide enough to hold worlds not yet born. She wears the double plumes of majesty and her eyes shine with the promise of nurture.",
        chapters: ["ch_1", "ch_3"],
        domains: ["Motherhood", "Nurture", "Protection", "Divine Majesty"],
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
      },
      {
        name: "Tatenen",
        description: "The rising earth, emerging from the primordial waters to form the first land. Tatenen represents the physical manifestation of creation, the solid ground upon which life can flourish.",
        chapters: ["ch_4"],
        domains: ["Earth", "Land", "Foundation", "Physical Creation"],
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
      },
      {
        name: "Khonsu",
        description: "The divine timekeeper, the youthful god who marks the passage of time and governs the cycles of the moon. Khonsu brings order to temporal existence and guides the rhythm of cosmic cycles.",
        chapters: ["ch_5"],
        domains: ["Time", "Moon", "Cycles", "Youth"],
        image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78"
      }
    ];

    return characters;
  };

  const characters = chapters ? extractCharacters(chapters) : [];

  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.domains.some(domain => domain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getChapterTitle = (chapterId: string): string => {
    const chapter = chapters?.find(ch => ch.id === chapterId);
    return chapter?.title || chapterId;
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Eye className="w-6 h-6" />
              Character Gallery
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-muted-foreground">Loading characters...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Eye className="w-6 h-6" />
            Character Gallery - Egyptian Gods & Divine Beings
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4"
            data-testid="button-close-gallery"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search characters or domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-character-search"
            />
          </div>

          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredCharacters.map((character) => (
                <Card 
                  key={character.name} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCharacter(character)}
                  data-testid={`card-character-${character.name.toLowerCase()}`}
                >
                  <CardHeader>
                    <div className="relative h-32 mb-4 overflow-hidden rounded-lg">
                      <img
                        src={character.image}
                        alt={character.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <CardTitle className="absolute bottom-2 left-2 text-white text-lg">
                        {character.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {character.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {character.domains.slice(0, 2).map(domain => (
                        <Badge key={domain} variant="secondary" className="text-xs">
                          {domain}
                        </Badge>
                      ))}
                      {character.domains.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{character.domains.length - 2} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="w-3 h-3" />
                      {character.chapters.length} chapter{character.chapters.length !== 1 ? 's' : ''}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCharacters.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No characters found matching your search.</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Character Detail Modal */}
        {selectedCharacter && (
          <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={selectedCharacter.image}
                      alt={selectedCharacter.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96";
                      }}
                    />
                  </div>
                  {selectedCharacter.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="relative h-48 overflow-hidden rounded-lg">
                  <img
                    src={selectedCharacter.image}
                    alt={selectedCharacter.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96";
                    }}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedCharacter.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Domains & Aspects</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.domains.map(domain => (
                      <Badge key={domain} variant="secondary">
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Appears in Chapters</h3>
                  <div className="space-y-1">
                    {selectedCharacter.chapters.map(chapterId => (
                      <div key={chapterId} className="text-sm text-muted-foreground">
                        • {getChapterTitle(chapterId)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}