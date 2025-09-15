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

  // Extract characters from the book chapters aligned with semi-academic retelling format
  const extractCharacters = (chapters: BookChapter[]): Character[] => {
    const characters: Character[] = [
      {
        name: "Nu – The Primordial Waters",
        description: "Nu was the boundless chaos from which creation emerged. He was not worshipped with temples but acknowledged as the eternal ocean underlying existence. Nu represents both chaos and potential—a reminder of the cosmos' fragile order sustained by the gods.",
        chapters: ["prologue", "ch_59"],
        domains: ["Primordial Waters", "Chaos", "Creation", "Eternal Ocean"],
        image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000"
      },
      {
        name: "Ra – The Solar King",
        description: "Ra, the great sun god, sailed daily across the heavens and nightly through the underworld. Each dawn was a triumph over Apophis, the serpent of chaos. Pharaohs styled themselves as 'sons of Ra,' inheritors of his divine light. Ra's cycle reflected Egyptian cosmology: life was a struggle of order against chaos, repeated every day, ensuring cosmic stability.",
        chapters: ["ch_61"],
        domains: ["Sun", "Kingship", "Divine Light", "Cosmic Order"],
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
      },
      {
        name: "Horus – The Falcon God of Kingship",
        description: "Horus, the falcon soaring over the Nile, was the eternal symbol of kingship. As the avenger of his father Osiris, he waged long war against his uncle Seth, the god of chaos. Every Pharaoh thereafter was considered the 'Living Horus,' an embodiment of divine authority.",
        chapters: ["ch_41"],
        domains: ["Kingship", "Vengeance", "Divine Authority", "Sky"],
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
      },
      {
        name: "Isis – The Great Mother",
        description: "Isis was both healer and sorceress, mother and queen. Her devotion to Osiris after his murder exemplified the power of love and magic to overcome death. She restored Osiris to life long enough to conceive Horus, thus ensuring the continuation of kingship. Her worship spread far beyond Egypt, reaching Rome.",
        chapters: ["ch_42"],
        domains: ["Magic", "Motherhood", "Healing", "Divine Love"],
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
      },
      {
        name: "Osiris – The Lord of the Afterlife",
        description: "Osiris ruled as the first king of Egypt until betrayed by his brother Seth. Dismembered and scattered, he was restored by Isis and embalmed by Anubis. From then on, he reigned not over the living but over the dead, granting immortality to those judged righteous. Osiris symbolizes renewal and the agricultural cycle.",
        chapters: ["ch_43"],
        domains: ["Afterlife", "Death", "Resurrection", "Judgment"],
        image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78"
      },
      {
        name: "Seth – The Lord of Chaos",
        description: "Seth, the desert storm, was both protector and betrayer. He defended Ra's solar barque against the serpent Apophis but murdered his own brother Osiris. His strange, composite animal form reflected his role as outsider and necessary disruptor. Seth embodies the duality of chaos: destructive yet at times essential.",
        chapters: ["ch_44"],
        domains: ["Chaos", "Desert", "Storm", "Necessary Discord"],
        image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78"
      },
      {
        name: "Ma'at – The Feather of Truth",
        description: "Ma'at was not only a goddess but also the principle of truth, balance, and cosmic order. Every Pharaoh swore to uphold Ma'at. In the Hall of Judgment, the hearts of the dead were weighed against her feather. Ma'at was central to Egyptian religion and society.",
        chapters: ["ch_46"],
        domains: ["Truth", "Justice", "Cosmic Order", "Balance"],
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
      },
      {
        name: "Thoth – The Divine Scribe",
        description: "Thoth, ibis-headed lord of wisdom, measured time, invented writing, and mediated disputes among the gods. In the underworld, he recorded the verdict of the weighing of hearts. Thoth symbolizes intellect and order, essential to law, astronomy, and writing—cornerstones of Egyptian civilization.",
        chapters: ["ch_63"],
        domains: ["Wisdom", "Writing", "Time", "Divine Knowledge"],
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
      },
      {
        name: "Anubis – Guardian of the Dead",
        description: "Jackal-headed Anubis embalmed Osiris and became patron of mummification. He guided souls through the necropolis and ensured their hearts were weighed justly. Anubis reflects the Egyptian concern with proper burial and assured people that death could be navigated safely.",
        chapters: ["ch_64"],
        domains: ["Death", "Mummification", "Burial", "Soul Guidance"],
        image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78"
      },
      {
        name: "Khonsu – The Moon Wanderer",
        description: "Khonsu, god of the moon, traveled nightly across the sky. Known as a healer, his name means 'traveler.' Myths depict him gambling away time to Thoth, explaining the extra days added to the calendar. Khonsu connects lunar cycles with healing, timekeeping, and fertility.",
        chapters: ["ch_50"],
        domains: ["Moon", "Healing", "Time", "Travel"],
        image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78"
      },
      {
        name: "Amun – The Hidden One",
        description: "Amun began as a local Theban god but rose to prominence as 'Amun-Ra,' king of the gods. Invisible and mysterious, he was considered the unseen force behind existence. The political rise of Thebes paralleled the rise of Amun, showing how theology followed history.",
        chapters: ["ch_52"],
        domains: ["Mystery", "Hidden Power", "Kingship", "Thebes"],
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
      },
      {
        name: "Mut – The Mother Goddess",
        description: "Mut, consort of Amun, was depicted as a vulture goddess, motherly yet regal. She represented protection and sovereignty. Mut's role underscores the maternal dimension of kingship: the Pharaoh was 'son of Mut,' nurtured by divine motherhood.",
        chapters: ["ch_53"],
        domains: ["Motherhood", "Protection", "Sovereignty", "Royal Nurture"],
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
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