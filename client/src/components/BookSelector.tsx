import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, BookOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string | null;
  genre: string;
  totalChapters: number;
  tags: string[];
  createdAt: string;
}

interface BookSelectorProps {
  selectedBookId?: string;
  onBookSelect: (bookId: string) => void;
}

export default function BookSelector({ selectedBookId, onBookSelect }: BookSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"]
  });

  const selectedBook = books?.find(book => book.id === selectedBookId);

  if (isLoading) {
    return (
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-md animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded animate-pulse mb-1" />
            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return null;
  }

  // If only one book, show it without dropdown
  if (books.length === 1) {
    const book = books[0];
    return (
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{book.title}</h3>
            <p className="text-xs text-muted-foreground truncate">by {book.author}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-border">
      {/* Current Book Display */}
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-0 h-auto hover:bg-muted/50"
        data-testid="button-book-selector"
      >
        <div className="flex items-center gap-3 w-full p-2">
          <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className="font-medium text-sm truncate">
              {selectedBook?.title || "Select a Book"}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {selectedBook ? `by ${selectedBook.author}` : `${books.length} books available`}
            </p>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform", 
            isExpanded && "transform rotate-180"
          )} />
        </div>
      </Button>

      {/* Book Selection Dropdown */}
      {isExpanded && (
        <div className="mt-2 space-y-2 max-h-80 overflow-y-auto">
          {books.map((book) => {
            const isSelected = book.id === selectedBookId;
            
            return (
              <Card 
                key={book.id}
                className={cn(
                  "cursor-pointer transition-all hover:bg-muted/50",
                  isSelected && "ring-2 ring-primary"
                )}
                onClick={() => {
                  onBookSelect(book.id);
                  setIsExpanded(false);
                }}
                data-testid={`book-card-${book.id}`}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={`${book.title} cover`}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight truncate">
                        {book.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        by {book.author}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {book.genre}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {book.totalChapters} chapters
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}