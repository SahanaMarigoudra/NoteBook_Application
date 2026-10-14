import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { NOTEBOOK_TEMPLATES } from '@/data/notebookTemplates';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, Pin, Star, Archive, ArrowLeft, Check, AlertCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNote, useCreateNote, useUpdateNote } from '@/hooks/useNotes';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().max(500000),
  categoryId: z.string().optional(),
  isPinned: z.boolean(),
  isFavorite: z.boolean(),
});

type FormData = z.infer<typeof schema>;

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function NoteEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existingNote, isLoading: noteLoading } = useNote(id ?? '');
  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const createNote = useCreateNote();
  const updateNote = useUpdateNote(id ?? '');

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedContentRef = useRef('');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', content: '', categoryId: '', isPinned: false, isFavorite: false },
  });

  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');

  // Populate form from notebook template if creating new note
  useEffect(() => {
    if (!isEdit && templateParam) {
      const tpl = NOTEBOOK_TEMPLATES.find((t) => t.id === templateParam);
      if (tpl) {
        setValue('title', tpl.defaultTitle);
        setValue('content', tpl.defaultContent);
        if (categories && categories.length > 0) {
          const matched = categories.find((c) => c.name.toLowerCase() === tpl.suggestedCategory.toLowerCase());
          if (matched) {
            setValue('categoryId', matched._id);
          }
        }
        setIsDirty(true);
        toast.info(`Loaded ${tpl.name} template`);
      }
    }
  }, [isEdit, templateParam, categories, setValue]);

  // Populate form when editing
  useEffect(() => {
    if (existingNote && isEdit) {
      reset({
        title: existingNote.title,
        content: existingNote.content,
        categoryId: existingNote.categoryId?._id ?? '',
        isPinned: existingNote.isPinned,
        isFavorite: existingNote.isFavorite,
      });
      setSelectedTags(existingNote.tags.map((t) => t._id));
      savedContentRef.current = existingNote.content;
    }
  }, [existingNote, isEdit, reset]);

  const watchedContent = watch('content');
  const watchedTitle = watch('title');
  const [debouncedContent] = useDebounce(watchedContent, 2000);
  const [debouncedTitle] = useDebounce(watchedTitle, 2000);

  // Autosave for edit mode
  useEffect(() => {
    if (!isEdit || !isDirty) return;
    const doAutoSave = async () => {
      try {
        setSaveStatus('saving');
        const values = { title: debouncedTitle, content: debouncedContent, tags: selectedTags };
        await updateNote.mutateAsync(values);
        setSaveStatus('saved');
        setIsDirty(false);
        savedContentRef.current = debouncedContent;
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch {
        setSaveStatus('error');
      }
    };
    doAutoSave();
  }, [debouncedContent, debouncedTitle]);

  const handleFieldChange = () => setIsDirty(true);

  const onSubmit = async (data: FormData) => {
    try {
      setSaveStatus('saving');
      const payload = {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId || null,
        tags: selectedTags,
        isPinned: data.isPinned,
        isFavorite: data.isFavorite,
      };
      if (isEdit) {
        await updateNote.mutateAsync(payload);
        toast.success('Note saved');
      } else {
        const note = await createNote.mutateAsync(payload);
        toast.success('Note created');
        navigate(`/notes/${note._id}/edit`, { replace: true });
      }
      setSaveStatus('saved');
      setIsDirty(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setSaveStatus('error');
      toast.error(err?.response?.data?.error ?? 'Failed to save note');
    }
  };

  const toggleTag = (tagId: string) => {
    setIsDirty(true);
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);
  };

  const charCount = watchedContent?.length ?? 0;

  if (isEdit && noteLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {/* Save status */}
            {saveStatus === 'saving' && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving…
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Save failed
              </span>
            )}
            <Button type="submit" size="sm" disabled={saveStatus === 'saving'}>
              <Save className="h-4 w-4 mr-1.5" />
              {isEdit ? 'Save' : 'Create Note'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
          {/* Main editor */}
          <div className="space-y-4">
            <div>
              <Input
                id="note-title"
                placeholder="Note title"
                className="text-lg font-medium h-11 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                {...register('title', { onChange: handleFieldChange })}
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Textarea
                id="note-content"
                placeholder="Start writing..."
                className="min-h-[400px] resize-y border-0 px-0 focus-visible:ring-0 text-sm leading-relaxed"
                {...register('content', { onChange: handleFieldChange })}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{charCount.toLocaleString()} characters</p>
            </div>
          </div>

          {/* Sidebar options */}
          <div className="space-y-5">
            {/* Category */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(v) => { setValue('categoryId', v === 'none' ? '' : v); handleFieldChange(); }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</Label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tags?.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => toggleTag(tag._id)}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors ${
                      selectedTags.includes(tag._id)
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {tag.name}
                    {selectedTags.includes(tag._id) && <X className="ml-1 h-3 w-3" />}
                  </button>
                ))}
                {(!tags || tags.length === 0) && (
                  <p className="text-xs text-muted-foreground">No tags yet.</p>
                )}
              </div>
            </div>

            {/* Pin & Favorite */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Options</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setValue('isPinned', !watch('isPinned')); handleFieldChange(); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-medium transition-colors ${
                    watch('isPinned') ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <Pin className={`h-3.5 w-3.5 ${watch('isPinned') ? 'fill-primary' : ''}`} />
                  Pinned
                </button>
                <button
                  type="button"
                  onClick={() => { setValue('isFavorite', !watch('isFavorite')); handleFieldChange(); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-medium transition-colors ${
                    watch('isFavorite') ? 'border-amber-400/40 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'border-border hover:border-amber-400/30'
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${watch('isFavorite') ? 'fill-amber-400 text-amber-500' : ''}`} />
                  Favorite
                </button>
              </div>
            </div>

            {/* Created/Updated info */}
            {existingNote && (
              <div className="rounded-md border p-3 text-xs text-muted-foreground space-y-1">
                <div><span className="font-medium">Created:</span> {new Date(existingNote.createdAt).toLocaleString()}</div>
                <div><span className="font-medium">Updated:</span> {new Date(existingNote.updatedAt).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
