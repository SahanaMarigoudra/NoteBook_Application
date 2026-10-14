import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTags';

export default function TagsPage() {
  const { data: tags, isLoading } = useTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();
  const [newTag, setNewTag] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    try { await createMutation.mutateAsync({ name: newTag.trim() }); setNewTag(''); toast.success('Tag created'); }
    catch (err: any) { toast.error(err?.response?.data?.error ?? 'Failed to create'); }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try { await updateMutation.mutateAsync({ id, name: editName.trim() }); setEditId(null); toast.success('Tag updated'); }
    catch (err: any) { toast.error(err?.response?.data?.error ?? 'Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteMutation.mutateAsync(id); toast.success('Tag deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Tags</h1>
        <p className="text-sm text-muted-foreground">Manage tags across your notes</p>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          id="new-tag-input"
          placeholder="New tag name..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={createMutation.isPending || !newTag.trim()} size="sm">
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : !tags?.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Tag className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium">No tags yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create tags to label your notes</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div key={tag._id} className="flex items-center gap-1 rounded-full border bg-card px-3 py-1.5">
              {editId === tag._id ? (
                <>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-5 w-24 text-xs border-0 px-0 focus-visible:ring-0" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(tag._id); if (e.key === 'Escape') setEditId(null); }} />
                  <button className="text-primary hover:text-primary/80" onClick={() => handleUpdate(tag._id)}><Check className="h-3.5 w-3.5" /></button>
                  <button className="text-muted-foreground hover:text-foreground" onClick={() => setEditId(null)}><X className="h-3.5 w-3.5" /></button>
                </>
              ) : (
                <>
                  <span className="text-sm">{tag.name}</span>
                  <button className="ml-1 text-muted-foreground hover:text-foreground" onClick={() => { setEditId(tag._id); setEditName(tag.name); }}><Edit2 className="h-3 w-3" /></button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete tag "{tag.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>This tag will be removed from all notes.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(tag._id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
