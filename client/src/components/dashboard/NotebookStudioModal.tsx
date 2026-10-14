import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Save,
  ExternalLink,
  Sparkles,
  Bookmark,
  CheckCircle2,
  Circle,
  Plus,
  Loader2,
  Leaf,
  Coffee,
  Lightbulb,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateNote } from '@/hooks/useNotes';
import { useCategories } from '@/hooks/useCategories';
import { NOTEBOOK_TEMPLATES, NotebookTemplate } from '@/data/notebookTemplates';

interface NotebookStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplate?: 'study' | 'journal' | 'ideas' | 'tasks';
}

export function NotebookStudioModal({
  open,
  onOpenChange,
  initialTemplate = 'study',
}: NotebookStudioModalProps) {
  const navigate = useNavigate();
  const createNote = useCreateNote();
  const { data: categories } = useCategories();

  const [activeTab, setActiveTab] = useState<'study' | 'journal' | 'ideas' | 'tasks'>(initialTemplate);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields in the open notebook
  const currentTemplate = NOTEBOOK_TEMPLATES.find((t) => t.id === activeTab) || NOTEBOOK_TEMPLATES[0];

  const [title, setTitle] = useState(currentTemplate.defaultTitle);
  const [leftPageNote, setLeftPageNote] = useState(
    activeTab === 'study'
      ? 'The biochemical process by which photoautotrophs convert sunlight, H₂O, and CO₂ into high-energy carbohydrates (glucose) and vital O₂.'
      : activeTab === 'journal'
      ? 'Woke up early before the neighborhood stirred. Brewed fresh coffee and watched golden leaves drift across the wet pavement. In stillness, scattered thoughts finally find their natural rhythm.'
      : activeTab === 'ideas'
      ? 'A digital sanctuary that blends the physical tactility of heavy-grain stationery with instant search, semantic tagging, and cryptographic data sovereignty.'
      : 'Delivering a high-performance, enterprise-tested notes platform with complete MongoDB persistence, verified admin oversight, and delightful tactile polish.'
  );

  const [stickyNoteText, setStickyNoteText] = useState(
    activeTab === 'study'
      ? '📌 Remember to revise!'
      : activeTab === 'journal'
      ? '🌿 Breathe & be present.'
      : activeTab === 'ideas'
      ? '💡 Test prototype on Friday!'
      : '🎯 Inbox Zero achieved!'
  );

  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: '1', text: 'Submit Plant Physiology lab writeup', done: true },
    { id: '2', text: 'Review Chapter 8 electron transport slides', done: true },
    { id: '3', text: 'Prepare flashcards for Calvin cycle enzymes', done: false },
    { id: '4', text: 'Group review at Library Atrium', done: false },
  ]);

  const handleTabChange = (newTab: 'study' | 'journal' | 'ideas' | 'tasks') => {
    setActiveTab(newTab);
    const tpl = NOTEBOOK_TEMPLATES.find((t) => t.id === newTab) || NOTEBOOK_TEMPLATES[0];
    setTitle(tpl.defaultTitle);

    if (newTab === 'study') {
      setLeftPageNote('The biochemical process by which photoautotrophs convert sunlight, H₂O, and CO₂ into high-energy carbohydrates (glucose) and vital O₂.');
      setStickyNoteText('📌 Remember to revise!');
      setChecklist([
        { id: '1', text: 'Submit Plant Physiology lab writeup', done: true },
        { id: '2', text: 'Review Chapter 8 electron transport slides', done: true },
        { id: '3', text: 'Prepare flashcards for Calvin cycle enzymes', done: false },
        { id: '4', text: 'Group review at Library Atrium', done: false },
      ]);
    } else if (newTab === 'journal') {
      setLeftPageNote('Woke up early before the neighborhood stirred. Brewed fresh coffee and watched golden leaves drift across the wet pavement. In stillness, scattered thoughts finally find their natural rhythm.');
      setStickyNoteText('🌿 Breathe & be present.');
      setChecklist([
        { id: '1', text: 'Warm pour-over coffee by the sunny window', done: true },
        { id: '2', text: 'Encouraging message from an old friend', done: true },
        { id: '3', text: 'Steady progress on NoteSpace architecture', done: true },
        { id: '4', text: 'Quiet 20-minute reading session before dinner', done: false },
      ]);
    } else if (newTab === 'ideas') {
      setLeftPageNote('A digital sanctuary that blends the physical tactility of heavy-grain stationery with instant search, semantic tagging, and cryptographic data sovereignty.');
      setStickyNoteText('💡 Test prototype on Friday!');
      setChecklist([
        { id: '1', text: 'Interactive 3D dual-page notebook landing experience', done: true },
        { id: '2', text: 'Physical color-coded tabs with 600ms page turns', done: true },
        { id: '3', text: 'Bi-directional [[wiki]] note interlinking', done: false },
        { id: '4', text: 'Offline-first sync engine with local IndexedDB', done: false },
      ]);
    } else {
      setLeftPageNote('Delivering a high-performance, enterprise-tested notes platform with complete MongoDB persistence, verified admin oversight, and delightful tactile polish.');
      setStickyNoteText('🎯 Inbox Zero achieved!');
      setChecklist([
        { id: '1', text: 'Verify compound indexes on MongoDB note title & tags', done: true },
        { id: '2', text: 'Audit security cookies & rate-limiting middleware', done: true },
        { id: '3', text: 'Ship interactive 3D notebook hero with paper tabs', done: true },
        { id: '4', text: 'Deploy production release bundle to cloud hosting', done: false },
      ]);
    }
  };

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleSaveToDatabase = async () => {
    try {
      setIsSaving(true);
      const matchedCat = categories?.find(
        (c) => c.name.toLowerCase() === currentTemplate.suggestedCategory.toLowerCase()
      );

      const checklistMarkdown = checklist
        .map((c) => `- [${c.done ? 'x' : ' '}] ${c.text}`)
        .join('\n');

      const fullContent = `# ${title}

**Notebook Category:** ${currentTemplate.name}
**Date:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

## Overview & Reflection
${leftPageNote}

> **Sticky Note:** ${stickyNoteText}

## Action Items & Checklist
${checklistMarkdown}
`;

      const newNote = await createNote.mutateAsync({
        title: title || currentTemplate.defaultTitle,
        content: fullContent,
        categoryId: matchedCat?._id ?? null,
        isPinned: isBookmarked,
        isFavorite: activeTab === 'journal',
      });

      toast.success('✨ Notebook note successfully created in MongoDB!');
      onOpenChange(false);
      navigate(`/notes/${newNote._id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to create note in database');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenInFullEditor = () => {
    onOpenChange(false);
    navigate(`/notes/new?template=${activeTab}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-4 sm:p-6 bg-[#F7F3EB] border-[#DDD5C5] text-[#292821] overflow-y-auto max-h-[92vh]">
        <DialogHeader className="pb-3 border-b border-[#E8DEC8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3D2C20] flex items-center justify-center text-[#F7F3EB]">
                <BookOpen className="w-4 h-4 text-[#D4A373]" />
              </div>
              <div>
                <DialogTitle className="font-serif text-xl sm:text-2xl font-bold text-[#292821]">
                  NoteSpace Notebook Studio
                </DialogTitle>
                <DialogDescription className="text-xs text-[#8A7967]">
                  Write directly into realistic stationery pages. Automatically saves to your MongoDB database.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInFullEditor}
                className="hidden sm:flex items-center gap-1.5 border-[#D8CEBD] text-xs hover:bg-[#EFE8D8]"
              >
                <span>Full Markdown Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                onClick={handleSaveToDatabase}
                disabled={isSaving}
                className="bg-[#B96F52] hover:bg-[#A35D42] text-white text-xs font-semibold px-3.5 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>Saving to MongoDB...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    <span>Save Note to DB</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Notebook Preview Frame */}
        <div className="relative mt-2 p-3 sm:p-5 rounded-xl notebook-leather-cover">
          {/* Bookmark Ribbon */}
          <button
            type="button"
            onClick={() => setIsBookmarked(!isBookmarked)}
            title={isBookmarked ? 'Bookmarked! Will pin note in MongoDB' : 'Click to bookmark and pin'}
            className={`absolute -top-2 left-10 z-30 flex flex-col items-center cursor-pointer transition-transform ${
              isBookmarked ? 'translate-y-2' : ''
            }`}
          >
            <div className="w-6 h-10 bg-[#B96F52] shadow-md relative flex items-center justify-center">
              <Bookmark className={`w-3.5 h-3.5 text-white ${isBookmarked ? 'fill-white' : ''}`} />
            </div>
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[8px] border-t-[#B96F52]" />
          </button>

          {/* Physical Colored Tabs on Right Edge */}
          <div className="absolute -right-3 top-10 z-20 flex flex-col gap-2">
            {NOTEBOOK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTabChange(t.id)}
                style={{ backgroundColor: t.color }}
                className={`px-3 py-1.5 rounded-r-md text-[11px] font-semibold text-white shadow-md transition-all ${
                  activeTab === t.id
                    ? 'translate-x-1.5 font-bold shadow-lg ring-1 ring-white/60'
                    : 'opacity-85 hover:opacity-100 hover:translate-x-0.5'
                }`}
              >
                {t.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Dual Page Paper Container */}
          <div className="rounded-lg overflow-hidden notebook-paper-stack bg-[#FAF6EE] border border-[#DDD5C5]">
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[380px] sm:min-h-[420px] text-[#292821]">
              
              {/* LEFT PAGE */}
              <div className="relative p-5 sm:p-6 flex flex-col justify-between notebook-left-page notebook-ruled-lines border-b md:border-b-0 md:border-r border-[#E8DEC8]">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8A7967] mb-2 pb-1 border-b border-[#E8DEC8]">
                    <span className="font-semibold tracking-wider uppercase text-[10px]">
                      {currentTemplate.badge}
                    </span>
                    <span className="font-serif italic text-xs">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Editable Note Title */}
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter notebook title..."
                    className="w-full font-serif text-xl sm:text-2xl font-bold text-[#292821] bg-transparent border-b border-dashed border-[#D4CBB8] focus:border-[#B96F52] focus:outline-none mb-3 py-0.5"
                  />

                  {/* Editable Body Prose */}
                  <textarea
                    rows={6}
                    value={leftPageNote}
                    onChange={(e) => setLeftPageNote(e.target.value)}
                    placeholder="Type your notes and thoughts here..."
                    className="w-full text-xs sm:text-sm text-[#3E3A33] leading-relaxed bg-transparent border-none resize-none focus:outline-none font-sans"
                  />
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-[#8A7967] border-t border-[#E8DEC8]">
                  <span className="font-serif italic">Category: {currentTemplate.suggestedCategory}</span>
                  <span className="font-mono">Page 01</span>
                </div>
              </div>

              {/* RIGHT PAGE */}
              <div className="relative p-5 sm:p-6 flex flex-col justify-between notebook-right-page notebook-ruled-lines">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8A7967] mb-2 pb-1 border-b border-[#E8DEC8]">
                    <span className="font-serif italic text-xs">Checklist & Action Queue</span>
                    <span className="font-mono text-[11px]">Page 02</span>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-[#292821] mb-2">
                    Action Items
                  </h4>

                  <div className="space-y-2 mb-4">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className="flex items-start gap-2.5 text-xs sm:text-sm cursor-pointer p-1 rounded hover:bg-[#F2ECE0] transition-colors"
                      >
                        <button type="button" className="mt-0.5 text-[#8A7967]">
                          {item.done ? (
                            <CheckCircle2 className="w-4 h-4 text-[#A6B49A]" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#B5A997]" />
                          )}
                        </button>
                        <span className={item.done ? 'line-through text-[#8A7967]' : 'text-[#2C2923] font-medium'}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editable Sticky Note */}
                <div className="space-y-2 pt-2">
                  <div className="relative p-2.5 rounded sticky-note-terracotta">
                    <span className="text-[10px] uppercase font-bold text-[#8C3D21] tracking-wider block mb-1">
                      Quick Sticky Note:
                    </span>
                    <input
                      type="text"
                      value={stickyNoteText}
                      onChange={(e) => setStickyNoteText(e.target.value)}
                      className="w-full text-xs font-semibold text-[#8C3D21] bg-transparent border-b border-dashed border-[#B96F52]/40 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8A7967] pt-2 border-t border-[#E8DEC8]">
                    <span className="font-serif italic">Real MongoDB Sync</span>
                    <span className="font-mono">NoteSpace Studio</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E8DEC8] text-xs text-[#6B5E4F]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B96F52]" />
            <span>
              Clicking <strong>Save Note to DB</strong> commits this note directly into your MongoDB cluster.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-[#D8CEBD] text-xs hover:bg-[#EFE8D8]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="bg-[#B96F52] hover:bg-[#A35D42] text-white text-xs font-semibold px-4"
            >
              {isSaving ? 'Saving...' : 'Save to MongoDB'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
