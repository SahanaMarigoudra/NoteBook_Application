import React, { useState } from 'react';
import { Tag as TagIcon, Search, Trash2, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAdminTags, useDeleteAdminTag } from '@/hooks/useAdmin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import type { Tag } from '@/types';

export default function AdminTagsPage() {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  const { data: tags, isLoading } = useAdminTags();
  const deleteMutation = useDeleteAdminTag();

  const filteredTags = (tags || []).filter((t) => {
    const owner = (t.userId as any) || {};
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (owner.name && owner.name.toLowerCase().includes(q)) ||
      (owner.email && owner.email.toLowerCase().includes(q))
    );
  });

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(`Tag #${deleteTarget.name} removed from all notes and deleted`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to delete tag');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TagIcon className="h-6 w-6 text-primary" />
            Tag Oversight
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage tags across all accounts. Deleting a tag cleanly unbinds it from notes without losing note content.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tag name or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Tag</th>
                  <th className="px-6 py-3.5">Owner</th>
                  <th className="px-6 py-3.5">Associated Notes</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : !filteredTags.length ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No tags found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredTags.map((t) => {
                    const owner = (t.userId as any) || {};
                    return (
                      <tr key={t._id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="font-mono text-xs">
                            #{t.name}
                          </Badge>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground">{owner.name || 'Unknown'}</p>
                              <p className="text-[11px] text-muted-foreground">{owner.email || '—'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-mono text-xs">
                            {t.noteCount ?? 0} notes
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(t.createdAt), 'MMM d, yyyy')}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(t)}
                            title="Delete Tag"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Tag Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Delete Tag "#{deleteTarget?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this tag? It will be safely unbound from {deleteTarget?.noteCount ?? 0} note(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubmit}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
