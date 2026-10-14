import React, { useState } from 'react';
import {
  FileText,
  Search,
  Eye,
  Trash2,
  Lock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Pin,
  Star,
  Archive,
  User,
  FolderOpen,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAdminNotes, useInspectAdminNote, useDeleteAdminNote } from '@/hooks/useAdmin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { Note } from '@/types';

export default function AdminNotesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Privacy Content Inspection State
  const [inspectTarget, setInspectTarget] = useState<Note | null>(null);
  const [inspectReason, setInspectReason] = useState('');
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  // Deletion State
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  const { data, isLoading } = useAdminNotes({
    search,
    status: statusFilter,
    page,
    limit: 10,
  });

  const inspectMutation = useInspectAdminNote();
  const deleteMutation = useDeleteAdminNote();

  const handleOpenInspectPrompt = (note: Note) => {
    setInspectTarget(note);
    setInspectReason('Compliance and support audit');
  };

  const handleConfirmInspect = async () => {
    if (!inspectTarget) return;
    try {
      const fullNote = await inspectMutation.mutateAsync({
        noteId: inspectTarget._id,
        reason: inspectReason,
      });
      setInspectTarget(null);
      setViewingNote(fullNote);
      toast.success('Privacy access verified & logged in audit trail');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to inspect note content');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success('Note permanently deleted by administrator');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to delete note');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Notes Oversight
          </h1>
          <p className="text-sm text-muted-foreground">
            Search note metadata across all users. Content access is strictly audited for user privacy.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search note titles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Notes</option>
              <option value="archived">Archived Notes</option>
              <option value="trashed">Trashed Notes</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Owner</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5">Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : !data?.notes.length ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No notes found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  data.notes.map((note) => {
                    const owner = (note.userId as any) || {};
                    const category = (note.categoryId as any) || null;

                    return (
                      <tr key={note._id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex items-center gap-2">
                            {note.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                            {note.isFavorite && <Star className="h-3.5 w-3.5 text-amber-500 shrink-0 fill-amber-500" />}
                            <span className="font-medium text-foreground truncate">{note.title}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-xs text-foreground truncate">{owner.name || 'Unknown'}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{owner.email || '—'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {category ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] gap-1 font-normal"
                              style={{ borderColor: `${category.color}40`, color: category.color }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                              {category.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {note.deletedAt ? (
                            <Badge variant="outline" className="text-rose-500 border-rose-500/30 text-[10px]">
                              Trashed
                            </Badge>
                          ) : note.isArchived ? (
                            <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                              Archived
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">
                              Active
                            </Badge>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(note.createdAt), 'MMM d, yyyy')}
                        </td>

                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Inspect Note Content (Audited)"
                              onClick={() => handleOpenInspectPrompt(note)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              title="Delete Note"
                              onClick={() => setDeleteTarget(note)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
              <span>
                Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total notes)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="h-7 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Guard Prompt Modal */}
      <Dialog open={!!inspectTarget} onOpenChange={(open) => !open && setInspectTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              <ShieldAlert className="h-5 w-5" />
              Privacy & Audit Warning
            </DialogTitle>
            <DialogDescription>
              To protect user confidentiality, private note content is shielded. Accessing the content of{' '}
              <strong>"{inspectTarget?.title}"</strong> will be recorded in the system audit trail.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <label className="text-xs font-medium text-foreground">
              Administrative Justification / Reason:
            </label>
            <Input
              value={inspectReason}
              onChange={(e) => setInspectReason(e.target.value)}
              placeholder="e.g., User support ticket #1234 or content violation report"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInspectTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmInspect}
              disabled={inspectReason.trim().length < 3 || inspectMutation.isPending}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              Confirm & View Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Content Viewer Modal */}
      <Dialog open={!!viewingNote} onOpenChange={(open) => !open && setViewingNote(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {viewingNote?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-3 pt-1">
              <span>Owner: {(viewingNote?.userId as any)?.email}</span>
              <span>•</span>
              <span>Updated: {viewingNote && format(new Date(viewingNote.updatedAt), 'PPP p')}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto rounded-lg border bg-muted/20 p-4 text-sm font-sans leading-relaxed whitespace-pre-wrap">
            {viewingNote?.content || <span className="italic text-muted-foreground">Empty note content</span>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingNote(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Permanently Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the note <strong>"{deleteTarget?.title}"</strong>?
              This action cannot be undone and will be permanently recorded in the audit log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubmit}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Note Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
