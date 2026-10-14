import React from 'react';
import { RotateCcw, Trash2, Archive, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNotes, useArchiveNote, useRestoreNote } from '@/hooks/useNotes';
import { NoteCard } from '@/components/notes/NoteCard';

export default function ArchivePage() {
  const { data, isLoading } = useNotes({ isArchived: 'true', limit: 50 });
  const restoreMutation = useRestoreNote();
  const archiveMutation = useArchiveNote();

  const handleRestore = async (id: string) => {
    try {
      await archiveMutation.mutateAsync({ id, isArchived: false });
      toast.success('Note restored to active');
    } catch { toast.error('Failed to restore'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold">Archive</h1>
        <p className="text-sm text-muted-foreground">{data?.pagination.total ?? 0} archived note{data?.pagination.total !== 1 ? 's' : ''}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : !data?.notes.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Archive className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium">No archived notes</p>
          <p className="text-sm text-muted-foreground mt-1">Archive notes to remove them from your main view</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.notes.map((note) => (
            <div key={note._id} className="relative">
              <NoteCard note={note} />
              <div className="absolute bottom-3 right-3">
                <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => handleRestore(note._id)}>
                  <RotateCcw className="h-3 w-3" /> Restore
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
