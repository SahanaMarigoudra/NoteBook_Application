import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2, FolderOpen, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';

const PRESET_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
});

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const [editId, setEditId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editColor, setEditColor] = useState('#6366f1');

  const createForm = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: '', color: '#6366f1' } });
  const editForm = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const handleCreate = async (data: z.infer<typeof schema>) => {
    try { await createMutation.mutateAsync(data); toast.success('Category created'); setCreateOpen(false); createForm.reset(); }
    catch (err: any) { toast.error(err?.response?.data?.error ?? 'Failed to create'); }
  };

  const startEdit = (cat: any) => {
    setEditId(cat._id);
    setEditColor(cat.color);
    editForm.reset({ name: cat.name, color: cat.color });
  };

  const handleUpdate = async (data: z.infer<typeof schema>) => {
    if (!editId) return;
    try { await updateMutation.mutateAsync({ id: editId, ...data }); toast.success('Category updated'); setEditId(null); }
    catch (err: any) { toast.error(err?.response?.data?.error ?? 'Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteMutation.mutateAsync(id); toast.success('Category deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize your notes by category</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input {...createForm.register('name')} placeholder="e.g. Work" className="mt-1" />
                {createForm.formState.errors.name && <p className="text-xs text-destructive mt-1">{createForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} type="button" className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110" style={{ background: c, borderColor: createForm.watch('color') === c ? '#fff' : c }}
                      onClick={() => createForm.setValue('color', c)} />
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></CardContent></Card>
      ) : !categories?.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium">No categories yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create categories to organize your notes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              {editId === cat._id ? (
                <form onSubmit={editForm.handleSubmit(handleUpdate)} className="flex-1 flex items-center gap-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {PRESET_COLORS.map((c) => (
                      <button key={c} type="button" className="h-5 w-5 rounded-full border transition-transform hover:scale-110" style={{ background: c, borderColor: editColor === c ? '#fff' : c }}
                        onClick={() => { setEditColor(c); editForm.setValue('color', c); }} />
                    ))}
                  </div>
                  <Input {...editForm.register('name')} className="flex-1 h-7 text-sm" />
                  <Button type="submit" size="icon" className="h-7 w-7"><Check className="h-3.5 w-3.5" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditId(null)}><X className="h-3.5 w-3.5" /></Button>
                </form>
              ) : (
                <>
                  <div className="h-4 w-4 rounded-full shrink-0" style={{ background: cat.color }} />
                  <span className="flex-1 text-sm font-medium">{cat.name}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(cat)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete category "{cat.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>Notes in this category will not be deleted, but will lose their category assignment.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(cat._id)}>Delete</AlertDialogAction>
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
