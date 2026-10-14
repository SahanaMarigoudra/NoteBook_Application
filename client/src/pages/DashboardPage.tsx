import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Pin,
  Star,
  Archive,
  BookOpen,
  Search,
  ArrowRight,
  FolderOpen,
  Calendar,
  Sparkles,
  Clock,
  ChevronRight,
  GraduationCap,
  BookHeart,
  Lightbulb,
  CheckSquare,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthContext';
import { useDashboardSummary } from '@/hooks/useDashboard';
import { useCategories } from '@/hooks/useCategories';
import { useNotes } from '@/hooks/useNotes';
import { NOTEBOOK_TEMPLATES } from '@/data/notebookTemplates';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  // Real pinned notes query
  const { data: pinnedNotesData, isLoading: pinnedLoading } = useNotes({
    isPinned: 'true',
    isArchived: 'false',
    limit: 6,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = summary?.stats;
  const pinnedNotes = pinnedNotesData?.notes ?? [];
  const recentNotes = summary?.recentlyUpdated ?? [];

  // Map category counts from real user summary data
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    if (summary?.byCategory) {
      for (const item of summary.byCategory) {
        counts[item.name.toLowerCase()] = item.count;
      }
    }
    return counts;
  }, [summary]);

  const getCategoryCount = (categoryName: string) => {
    return categoryCounts[categoryName.toLowerCase()] ?? 0;
  };

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('study') || lower.includes('academic') || lower.includes('lecture')) {
      return GraduationCap;
    }
    if (lower.includes('journal') || lower.includes('personal') || lower.includes('diary')) {
      return BookHeart;
    }
    if (lower.includes('idea') || lower.includes('concept') || lower.includes('brainstorm')) {
      return Lightbulb;
    }
    if (lower.includes('task') || lower.includes('todo') || lower.includes('work')) {
      return CheckSquare;
    }
    return FolderOpen;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* 1. Welcome & Primary Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {greeting()}, {user?.name?.split(' ')[0]}!
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3" />
              Digital Notebook
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · Welcome to your personal notes sanctuary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            asChild
            className="border-border hover:bg-accent text-foreground text-xs sm:text-sm font-medium"
          >
            <Link to="/search">
              <Search className="h-4 w-4 mr-1.5 text-muted-foreground" />
              Search Notes
            </Link>
          </Button>

          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 text-xs sm:text-sm shadow-sm"
          >
            <Link to="/notes/new">
              <Plus className="h-4 w-4 mr-1.5" />
              New Note
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Real User Note Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-7 w-10" />
            </Card>
          ))
        ) : (
          <>
            <Link
              to="/notes"
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-xs transition-all block"
            >
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-medium">Active Notes</span>
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-bold font-serif text-foreground">
                {stats?.totalActive ?? 0}
              </p>
            </Link>

            <Link
              to="/notes?isPinned=true"
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-xs transition-all block"
            >
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-medium">Pinned Notes</span>
                <Pin className="h-4 w-4 text-primary fill-primary group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-bold font-serif text-foreground">
                {stats?.totalPinned ?? 0}
              </p>
            </Link>

            <Link
              to="/notes?isFavorite=true"
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-xs transition-all block"
            >
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-medium">Favorites</span>
                <Star className="h-4 w-4 text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-bold font-serif text-foreground">
                {stats?.totalFavorite ?? 0}
              </p>
            </Link>

            <Link
              to="/archive"
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-xs transition-all block"
            >
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-medium">Archived</span>
                <Archive className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-bold font-serif text-foreground">
                {stats?.totalArchived ?? 0}
              </p>
            </Link>
          </>
        )}
      </div>

      {/* 3. Notebook Sections / Categories (General-Purpose Notebooks) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
              Notebook Categories
            </h2>
            <p className="text-xs text-muted-foreground">
              Organize your thinking into distinct personal notebooks. Click any category to view its notes.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs text-primary hover:text-primary hover:bg-primary/10"
          >
            <Link to="/categories">
              <span>Manage Categories</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoriesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4 bg-card border-border">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </Card>
            ))
          ) : (
            categories?.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              const noteCount = getCategoryCount(cat.name);
              return (
                <div
                  key={cat._id}
                  className="group relative rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  {/* Top tab accent */}
                  <div
                    className="absolute top-0 left-6 right-6 h-1 rounded-b-md"
                    style={{ backgroundColor: cat.color }}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-3 pt-1">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center border"
                        style={{
                          backgroundColor: `${cat.color}20`,
                          color: cat.color,
                          borderColor: `${cat.color}35`,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent text-foreground">
                        {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                      </span>
                    </div>

                    <Link
                      to={`/notes?categoryId=${cat._id}`}
                      className="font-serif text-base font-bold text-foreground hover:text-primary transition-colors block mb-1"
                    >
                      {cat.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Click to browse notes in {cat.name}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <Link
                      to={`/notes?categoryId=${cat._id}`}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Open Notes</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>

                    <Link
                      to={`/notes/new?categoryId=${cat._id}`}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                      title={`Create note in ${cat.name}`}
                    >
                      <Plus className="h-3 w-3" />
                      <span>Write</span>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Pinned Notes Row (if user has pinned notes) */}
      {pinnedNotes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-primary fill-primary" />
              <h2 className="font-serif text-lg font-bold text-foreground">
                Pinned Notes
              </h2>
            </div>
            <Link
              to="/notes?isPinned=true"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all pinned ({pinnedNotes.length})
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <Link
                key={note._id}
                to={`/notes/${note._id}/edit`}
                className="group rounded-xl border border-primary/30 bg-card p-4 hover:border-primary hover:shadow-sm transition-all relative block"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="font-serif italic text-primary font-medium">
                    {note.categoryId?.name || 'Uncategorized'}
                  </span>
                  <span className="text-[11px]">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                  {note.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {note.content || 'Blank note...'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 5. Start From A Notebook Template */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="font-serif text-lg font-bold text-foreground">
                Start from a Notebook Template
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Select a structured stationery template to open a prefilled note in the editor.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs border-border hover:bg-accent text-foreground w-fit"
            >
              <Link to="/notes/new">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Blank Note
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {NOTEBOOK_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-xl border border-border/80 bg-background/50 p-4 flex flex-col justify-between hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      style={{
                        backgroundColor: `${tpl.color}20`,
                        color: tpl.color,
                        borderColor: `${tpl.color}35`,
                      }}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md border"
                    >
                      {tpl.badge}
                    </span>
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-sm font-bold text-foreground mb-1">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {tpl.tagline}
                  </p>
                </div>

                <Button
                  size="sm"
                  asChild
                  className="w-full text-xs h-8 bg-primary/10 hover:bg-primary/20 text-primary font-medium border border-primary/20"
                >
                  <Link to={`/notes/new?template=${tpl.id}`}>
                    <span>Use Template</span>
                    <ArrowRight className="h-3 w-3 ml-1.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6. Recent Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-serif text-lg font-bold text-foreground">
              Recently Updated Notes
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs text-primary hover:text-primary hover:bg-primary/10"
          >
            <Link to="/notes">
              <span>View All Notes</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        {summaryLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/40">
            <BookOpen className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
            <p className="text-sm font-serif font-bold text-foreground mb-1">Your notebook is fresh and empty</p>
            <p className="text-xs text-muted-foreground mb-4">Capture your first thought, study note, or journal reflection.</p>
            <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link to="/notes/new">
                <Plus className="h-4 w-4 mr-1.5" />
                Create Your First Note
              </Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/60">
            {recentNotes.map((note) => (
              <Link
                key={note._id}
                to={`/notes/${note._id}/edit`}
                className="flex items-center justify-between p-3 sm:p-4 hover:bg-accent/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-muted-foreground group-hover:text-primary shrink-0 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {note.title}
                      </h4>
                      {note.isPinned && (
                        <Pin className="h-3 w-3 text-primary fill-primary shrink-0" />
                      )}
                      {note.isFavorite && (
                        <Star className="h-3 w-3 text-amber-500 fill-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {note.content ? note.content.slice(0, 90) : 'Blank note...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3 text-xs text-muted-foreground">
                  {note.categoryId?.name && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-accent text-foreground text-[11px] font-medium">
                      {note.categoryId.name}
                    </span>
                  )}
                  <span>
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
