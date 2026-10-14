import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Loader2, FileText } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/hooks/useDashboard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [debouncedQuery] = useDebounce(query, 400);
  const { data: results, isLoading, isFetching } = useSearch(debouncedQuery);

  useEffect(() => {
    if (debouncedQuery) setSearchParams({ q: debouncedQuery }, { replace: true });
    else setSearchParams({}, { replace: true });
  }, [debouncedQuery]);

  return (
    <div className="space-y-5 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold">Search</h1>
        <p className="text-sm text-muted-foreground">Search across all your notes</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input
          id="search-input"
          placeholder="Search notes by title or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-10"
          autoFocus
        />
        {(isLoading || isFetching) && (
          <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>

      {debouncedQuery.length >= 2 && (
        <div>
          {results?.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-medium">No results for "{debouncedQuery}"</p>
              <p className="text-sm text-muted-foreground mt-1">Try different keywords</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">{results?.length} result{results?.length !== 1 ? 's' : ''}</p>
              <div className="space-y-2">
                {results?.map((note: any) => (
                  <Link key={note._id} to={`/notes/${note._id}/edit`} className="block rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{note.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{note.content}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {note.categoryId && (
                            <span className="text-xs rounded-full px-2 py-0.5 font-medium" style={{ background: note.categoryId.color + '20', color: note.categoryId.color }}>
                              {note.categoryId.name}
                            </span>
                          )}
                          {note.tags?.slice(0, 3).map((tag: any) => (
                            <Badge key={tag._id} variant="secondary" className="text-xs py-0 px-1.5">{tag.name}</Badge>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {debouncedQuery.length > 0 && debouncedQuery.length < 2 && (
        <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
      )}
    </div>
  );
}
