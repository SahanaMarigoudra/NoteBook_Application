import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Save,
  Loader2,
  Pin,
  Star,
  Archive,
  Trash2,
  ArrowLeft,
  Check,
  AlertCircle,
  Plus,
  X,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNote, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';
import { NOTEBOOK_TEMPLATES } from '@/data/notebookTemplates';

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
  const [searchParams] = useSearchParams();
  const isEdit = !!id;

  const templateParam = searchParams.get('template');
  const categoryParam = searchParams.get('categoryId') || searchParams.get('category');

  const { data: existingNote, isLoading: noteLoading } = useNote(id ?? '');
  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const createNote = useCreateNote();
  const updateNote = useUpdateNote(id ?? '');
  const deleteNote = useDeleteNote();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const savedContentRef = useRef('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: categoryParam ?? '',
      isPinned: false,
      isFavorite: false,
    },
  });

  // Populate form from notebook template if creating a new note
  useEffect(() => {
    if (!isEdit) {
      if (templateParam) {
        const tpl = NOTEBOOK_TEMPLATES.find((t) => t.id === templateParam);
        if (tpl) {
          setValue('title', tpl.defaultTitle);
          setValue('content', tpl.defaultContent);
          if (categories && categories.length > 0) {
            const matched = categories.find(
              (c) => c.name.toLowerCase() === tpl.suggestedCategory.toLowerCase()
            );
            if (matched) {
              setValue('categoryId', matched._id);
            }
          }
          setIsDirty(true);
          toast.info(`Loaded ${tpl.name} template`);
        }
      } else if (categoryParam) {
        setValue('categoryId', categoryParam);
      }
    }
  }, [isEdit, templateParam, categoryParam, categories, setValue]);

  // Populate form when editing an existing note
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

  // Autosave for existing notes
  useEffect(() => {
    if (!isEdit || !isDirty) return;
    const doAutoSave = async () => {
      try {
        setSaveStatus('saving');
        const values = {
          title: debouncedTitle,
          content: debouncedContent,
          categoryId: watch('categoryId') || null,
          tags: selectedTags,
          isPinned: watch('isPinned'),
          isFavorite: watch('isFavorite'),
        };
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

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await deleteNote.mutateAsync(id);
      toast.success('Note moved to trash');
      navigate('/notes');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setIsDirty(true);
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const charCount = watchedContent?.length ?? 0;
  const wordCount = watchedContent
    ? watchedContent.trim().split(/\s+/).filter(Boolean).length
    : 0;

  if (isEdit && noteLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-16">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Top Action Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="hover:bg-accent text-foreground font-medium text-xs sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Notes
          </Button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time Save Status Indicator */}
            {saveStatus === 'saving' && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Saving note…</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Save failed</span>
              </span>
            )}

            {/* Delete button (when editing existing note) */}
            {isEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span>Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border text-foreground">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Move note to trash?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This note will be moved to your Trash. You can restore it anytime or permanently delete it later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Moving...' : 'Move to Trash'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Save Note Primary CTA */}
            <Button
              type="submit"
              size="sm"
              disabled={saveStatus === 'saving'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-sm"
            >
              <Save className="h-4 w-4 mr-1.5" />
              <span>{isEdit ? 'Save Note' : 'Create Note'}</span>
            </Button>
          </div>
        </div>

        {/* Two-Column Editor Layout: Note Paper Surface & Sidebar Attributes */}
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          {/* Main Paper Surface */}
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4 relative notebook-ruled-lines">
            {/* Top Date Header */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/60">
              <span className="font-serif italic">
                {isEdit && existingNote
                  ? `Updated ${new Date(existingNote.updatedAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}`
                  : `Created ${new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}`}
              </span>
              <span className="font-mono text-[11px]">
                {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
              </span>
            </div>

            {/* Title Input with Serif Styling */}
            <div>
              <Input
                id="note-title"
                placeholder="Give your note a title..."
                className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground bg-transparent border-0 border-b border-dashed border-border/80 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/60"
                {...register('title', { onChange: handleFieldChange })}
              />
              {errors.title && (
                <p className="text-xs text-destructive mt-1.5">{errors.title.message}</p>
              )}
            </div>

            {/* Content Textarea */}
            <div>
              <Textarea
                id="note-content"
                placeholder="Start writing your thoughts, ideas, or study notes..."
                className="min-h-[460px] resize-y bg-transparent border-0 px-0 focus-visible:ring-0 text-sm sm:text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 font-sans"
                {...register('content', { onChange: handleFieldChange })}
              />
            </div>
          </div>

          {/* Sidebar Note Attributes */}
          <div className="space-y-5">
            {/* Category Selector */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Notebook Category
              </Label>
              <Select
                value={watch('categoryId') || 'none'}
                onValueChange={(v) => {
                  setValue('categoryId', v === 'none' ? '' : v);
                  handleFieldChange();
                }}
              >
                <SelectTrigger className="w-full text-xs sm:text-sm bg-background border-border">
                  <SelectValue placeholder="Select notebook category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category (Unsorted)</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: cat.color }}
                        />
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Note Options: Pin & Favorite */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Quick Options
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setValue('isPinned', !watch('isPinned'));
                    handleFieldChange();
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
                    watch('isPinned')
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Pin className={`h-3.5 w-3.5 ${watch('isPinned') ? 'fill-primary' : ''}`} />
                  <span>Pinned</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('isFavorite', !watch('isFavorite'));
                    handleFieldChange();
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
                    watch('isFavorite')
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shadow-xs'
                      : 'border-border hover:border-amber-400 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${watch('isFavorite') ? 'fill-amber-400' : ''}`} />
                  <span>Favorite</span>
                </button>
              </div>
            </div>

            {/* Tags Selection */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Tags
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {tags?.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => toggleTag(tag._id)}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border transition-all ${
                      selectedTags.includes(tag._id)
                        ? 'bg-primary/15 border-primary/40 text-primary font-semibold'
                        : 'border-border hover:border-primary/30 text-muted-foreground'
                    }`}
                  >
                    <span>{tag.name}</span>
                    {selectedTags.includes(tag._id) && <X className="ml-1 h-3 w-3" />}
                  </button>
                ))}
                {(!tags || tags.length === 0) && (
                  <p className="text-xs text-muted-foreground">No tags created yet.</p>
                )}
              </div>
            </div>

            {/* Metadata Timestamp Box */}
            {existingNote && (
              <div className="rounded-xl border border-border/80 bg-card/60 p-4 text-xs text-muted-foreground space-y-1.5 font-sans">
                <div>
                  <span className="font-medium text-foreground">Created: </span>
                  {new Date(existingNote.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium text-foreground">Last modified: </span>
                  {new Date(existingNote.updatedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
