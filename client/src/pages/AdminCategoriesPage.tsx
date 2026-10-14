import React, { useState } from 'react';
import { FolderOpen, Search, Trash2, User, Layers, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAdminCategories, useDeleteAdminCategory } from '@/hooks/useAdmin';
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
import type { Category } from '@/types';

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories, isLoading } = useAdminCategories();
  const deleteMutation = useDeleteAdminCategory();

  const filteredCategories = (categories || []).filter((cat) => {
    const owner = (cat.userId as any) || {};
    const q = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      (owner.name && owner.name.toLowerCase().includes(q)) ||
      (owner.email && owner.email.toLowerCase().includes(q))
    );
  });

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(`Category "${deleteTarget.name}" deleted and unlinked from all notes`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            Category Oversight
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage user categories across the system. Deleting a category safely unlinks it from active notes.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by category name or owner..."
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
                  <th className="px-6 py-3.5">Category</th>
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
                ) : !filteredCategories.length ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No categories found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const owner = (cat.userId as any) || {};
                    return (
                      <tr key={cat._id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="font-semibold text-foreground">{cat.name}</span>
                          </div>
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
                            {cat.noteCount ?? 0} notes
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(cat.createdAt), 'MMM d, yyyy')}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(cat)}
                            title="Delete Category"
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

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Delete Category "{deleteTarget?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? The category will be permanently removed and unlinked
              from all {deleteTarget?.noteCount ?? 0} note(s) that currently reference it. The notes themselves will NOT be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubmit}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
