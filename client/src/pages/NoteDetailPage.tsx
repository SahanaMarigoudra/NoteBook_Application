import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft, Edit, Pin, Star, Archive, Trash2, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNote, usePinNote, useFavoriteNote, useArchiveNote, useDeleteNote } from '@/hooks/useNotes';

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: note, isLoading } = useNote(id!);
  const pinMutation = usePinNote();
  const favMutation = useFavoriteNote();
  const archiveMutation = useArchiveNote();
  const deleteMutation = useDeleteNote();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!note) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Note not found.</p><Button variant="ghost" onClick={() => navigate(-1)}>Go back</Button></div>;
  }

  const handlePin = async () => {
    try { await pinMutation.mutateAsync({ id: note._id, isPinned: !note.isPinned }); toast.success(note.isPinned ? 'Unpinned' : 'Pinned'); }
    catch { toast.error('Failed to update'); }
  };

  const handleFav = async () => {
    try { await favMutation.mutateAsync({ id: note._id, isFavorite: !note.isFavorite }); }
    catch { toast.error('Failed to update'); }
  };

  const handleArchive = async () => {
    try { await archiveMutation.mutateAsync({ id: note._id, isArchived: !note.isArchived }); toast.success(note.isArchived ? 'Restored from archive' : 'Archived'); }
    catch { toast.error('Failed to update'); }
  };

  const handleTrash = async () => {
    try { await deleteMutation.mutateAsync(note._id); toast.success('Moved to trash'); navigate('/notes'); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePin} title={note.isPinned ? 'Unpin' : 'Pin'}>
            <Pin className={`h-4 w-4 ${note.isPinned ? 'fill-primary text-primary' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFav} title={note.isFavorite ? 'Unfavorite' : 'Favorite'}>
            <Star className={`h-4 w-4 ${note.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleArchive} title={note.isArchived ? 'Restore' : 'Archive'}>
            {note.isArchived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleTrash} title="Move to trash">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="sm" asChild>
            <Link to={`/notes/${note._id}/edit`}><Edit className="h-4 w-4 mr-1.5" />Edit</Link>
          </Button>
        </div>
      </div>

      {/* Note content */}
      <article className="space-y-4">
        <h1 className="text-2xl font-semibold">{note.title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Created {format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
          <span>·</span>
          <span>Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
          {note.categoryId && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: note.categoryId.color }} />
                {note.categoryId.name}
              </span>
            </>
          )}
        </div>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <Badge key={tag._id} variant="secondary">{tag.name}</Badge>
            ))}
          </div>
        )}

        <Separator />

        <div className="prose dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{note.content}</pre>
        </div>
      </article>
    </div>
  );
}
