import React from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTrash, useRestoreNote, usePermanentDeleteNote, useEmptyTrash } from '@/hooks/useNotes';

export default function TrashPage() {
  const { data: notes, isLoading } = useTrash();
  const restoreMutation = useRestoreNote();
  const deleteMutation = usePermanentDeleteNote();
  const emptyMutation = useEmptyTrash();

  const handleRestore = async (id: string) => {
    try { await restoreMutation.mutateAsync(id); toast.success('Note restored'); }
    catch { toast.error('Failed to restore'); }
  };

  const handlePermanentDelete = async (id: string) => {
    try { await deleteMutation.mutateAsync(id); toast.success('Note permanently deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleEmptyTrash = async () => {
    try { await emptyMutation.mutateAsync(); toast.success('Trash emptied'); }
    catch { toast.error('Failed to empty trash'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Trash</h1>
          <p className="text-sm text-muted-foreground">{notes?.length ?? 0} deleted note{notes?.length !== 1 ? 's' : ''}</p>
        </div>
        {notes && notes.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1.5" /> Empty Trash
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Empty trash?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {notes.length} note{notes.length !== 1 ? 's' : ''} in trash. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleEmptyTrash}>
                  Empty Trash
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : !notes?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trash2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium">Trash is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Deleted notes will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note._id} className="flex items-start gap-4 rounded-lg border bg-card p-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{note.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Deleted {formatDistanceToNow(new Date(note.deletedAt!), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleRestore(note._id)}>
                  <RotateCcw className="h-3 w-3" /> Restore
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{note.title}" will be permanently deleted and cannot be recovered.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handlePermanentDelete(note._id)}>
                        Delete forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
