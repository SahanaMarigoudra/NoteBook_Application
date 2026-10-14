import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Pin, Star, Archive, Trash2, MoreVertical, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';
import { usePinNote, useFavoriteNote, useArchiveNote, useDeleteNote } from '@/hooks/useNotes';

interface NoteCardProps {
  note: Note;
  layout?: 'grid' | 'list';
}

export function NoteCard({ note, layout = 'grid' }: NoteCardProps) {
  const pinMutation = usePinNote();
  const favMutation = useFavoriteNote();
  const archiveMutation = useArchiveNote();
  const deleteMutation = useDeleteNote();

  const preview = note.content.slice(0, 150) + (note.content.length > 150 ? '…' : '');
  const updatedAgo = formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true });

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await pinMutation.mutateAsync({ id: note._id, isPinned: !note.isPinned });
      toast.success(note.isPinned ? 'Unpinned' : 'Pinned');
    } catch { toast.error('Failed to update note'); }
  };

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await favMutation.mutateAsync({ id: note._id, isFavorite: !note.isFavorite });
    } catch { toast.error('Failed to update note'); }
  };

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync({ id: note._id, isArchived: true });
      toast.success('Note archived');
    } catch { toast.error('Failed to archive'); }
  };

  const handleTrash = async () => {
    try {
      await deleteMutation.mutateAsync(note._id);
      toast.success('Moved to trash');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <Link
      to={`/notes/${note._id}`}
      className={cn(
        'note-card group block animate-fade-in relative',
        layout === 'list' && 'flex items-start gap-4'
      )}
    >
      {/* Pin / Fav indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handlePin}
          className={cn('p-1 rounded hover:bg-accent transition-colors', note.isPinned && 'opacity-100 text-primary')}
          aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          <Pin className={cn('h-3.5 w-3.5', note.isPinned ? 'fill-primary text-primary' : 'text-muted-foreground')} />
        </button>
        <button
          onClick={handleFav}
          className={cn('p-1 rounded hover:bg-accent transition-colors', note.isFavorite && 'text-amber-500')}
          aria-label={note.isFavorite ? 'Unfavorite' : 'Favorite'}
        >
          <Star className={cn('h-3.5 w-3.5', note.isFavorite ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground')} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.preventDefault()}
              className="p-1 rounded hover:bg-accent transition-colors"
              aria-label="Note actions"
            >
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/notes/${note._id}/edit`}>
                <Edit className="mr-2 h-3.5 w-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-3.5 w-3.5" /> Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleTrash} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Move to trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Note content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {note.isPinned && <Pin className="h-3 w-3 text-primary fill-primary shrink-0" />}
          {note.isFavorite && <Star className="h-3 w-3 text-amber-500 fill-amber-400 shrink-0" />}
          <h3 className="font-medium text-sm truncate">{note.title}</h3>
        </div>
        {preview && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{preview}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {note.categoryId && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: note.categoryId.color + '20', color: note.categoryId.color }}
            >
              {note.categoryId.name}
            </span>
          )}
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag._id} variant="secondary" className="text-xs py-0 px-1.5">
              {tag.name}
            </Badge>
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{note.tags.length - 3}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{updatedAgo}</p>
      </div>
    </Link>
  );
}
