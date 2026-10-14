import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, List, Search, SlidersHorizontal, FileText } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteCard } from '@/components/notes/NoteCard';
import { useNotes } from '@/hooks/useNotes';
import { useCategories } from '@/hooks/useCategories';
import type { NoteLayout } from '@/types';

export default function NotesPage() {
  const [layout, setLayout] = useState<NoteLayout>('grid');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('updatedAt');
  const [order, setOrder] = useState('desc');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch] = useDebounce(search, 400);

  const { data: categoriesData } = useCategories();

  const { data, isLoading, error } = useNotes({
    page,
    limit: 20,
    sort,
    order,
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    isArchived: 'false',
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Notes</h1>
          <p className="text-sm text-muted-foreground">
            {data?.pagination.total ?? 0} note{data?.pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/notes/new"><Plus className="h-4 w-4 mr-1.5" />New Note</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            id="notes-search"
            placeholder="Search notes..."
            className="pl-9 h-8 text-sm"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <Select value={categoryId} onValueChange={(v) => { setCategoryId(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="h-8 w-40 text-sm">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoriesData?.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={`${sort}-${order}`} onValueChange={(v) => { const [s, o] = v.split('-'); setSort(s); setOrder(o); setPage(1); }}>
          <SelectTrigger className="h-8 w-40 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt-desc">Last updated</SelectItem>
            <SelectItem value="createdAt-desc">Newest first</SelectItem>
            <SelectItem value="createdAt-asc">Oldest first</SelectItem>
            <SelectItem value="title-asc">Title A–Z</SelectItem>
            <SelectItem value="title-desc">Title Z–A</SelectItem>
            <SelectItem value="isPinned-desc">Pinned first</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={layout === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setLayout('grid')}
            aria-label="Grid layout"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setLayout('list')}
            aria-label="List layout"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notes grid/list */}
      {isLoading ? (
        <div className={layout === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={layout === 'grid' ? 'h-36' : 'h-20'} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Failed to load notes. Please try again.</p>
        </div>
      ) : !data?.notes.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
          {debouncedSearch || categoryId ? (
            <>
              <p className="font-medium">No notes match your filters</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(''); setCategoryId(''); }}>Clear filters</Button>
            </>
          ) : (
            <>
              <p className="font-medium">No notes yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first note to get started</p>
              <Button size="sm" className="mt-4" asChild><Link to="/notes/new"><Plus className="h-4 w-4 mr-1.5" />New Note</Link></Button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className={layout === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}>
            {data.notes.map((note) => (
              <NoteCard key={note._id} note={note} layout={layout} />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {data.pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.pagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
