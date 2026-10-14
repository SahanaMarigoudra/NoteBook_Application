import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ExternalLink,
  Check,
  CheckCircle2,
  Circle,
  Sparkles,
  Leaf,
  Coffee,
  Lightbulb,
  Target,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

type TabCategory = 'study' | 'journal' | 'ideas' | 'tasks';

interface PageSpreadData {
  id: TabCategory;
  tabLabel: string;
  tabColor: string;
  tabBgClass: string;
  tabActiveBorder: string;
  leftPage: {
    badge: string;
    date: string;
    title: string;
    definition: string;
    bullets: { label: string; text: string }[];
    highlightNote: string;
    highlightType: 'sage' | 'terracotta' | 'amber' | 'slate';
    doodle: 'leaf' | 'coffee' | 'lightbulb' | 'target';
    pageNum: string;
  };
  rightPage: {
    title: string;
    subtitle: string;
    schedule?: { day: string; task: string; done?: boolean }[];
    checklist: { id: string; text: string; done: boolean }[];
    stickyNote: string;
    handwrittenReminder: string;
    pageNum: string;
  };
}

const NOTEBOOK_SPREADS: PageSpreadData[] = [
  {
    id: 'study',
    tabLabel: 'Study',
    tabColor: '#A6B49A',
    tabBgClass: 'bg-[#A6B49A]',
    tabActiveBorder: 'border-[#7E8D72]',
    leftPage: {
      badge: 'BIOLOGY 101 · MODULE 04',
      date: 'Wednesday, Oct 14',
      title: 'Photosynthesis',
      definition:
        'The biochemical process by which photoautotrophs convert solar radiance, H₂O, and CO₂ into high-energy chemical bonds (glucose) and vital O₂.',
      bullets: [
        {
          label: 'Light-Dependent Phase:',
          text: 'Thylakoid membranes convert photons to ATP & NADPH; photolysis yields O₂.',
        },
        {
          label: 'Calvin-Benson Cycle:',
          text: 'Stroma matrix fixes atmospheric CO₂ via RuBisCO to synthesize triose sugars.',
        },
        {
          label: 'Pigment Absorption:',
          text: 'Chlorophyll a & b absorb 430nm (blue) and 660nm (red), reflecting green light.',
        },
      ],
      highlightNote: 'Key takeaway: Water photolysis in PSII generates all breathable atmospheric oxygen!',
      highlightType: 'sage',
      doodle: 'leaf',
      pageNum: '14',
    },
    rightPage: {
      title: 'My Week',
      subtitle: 'Week 42 · Bio Prep',
      schedule: [
        { day: 'Mon', task: 'Lab Report', done: true },
        { day: 'Tue', task: 'Ch. 8 Reading', done: true },
        { day: 'Wed', task: 'Quiz Prep', done: false },
        { day: 'Thu', task: 'Midterm', done: false },
        { day: 'Fri', task: 'Study Group', done: false },
      ],
      checklist: [
        { id: 's1', text: 'Submit Plant Physiology lab writeup', done: true },
        { id: 's2', text: 'Review Chapter 8 electron transport slides', done: true },
        { id: 's3', text: 'Prepare 35 flashcards for Calvin cycle enzymes', done: false },
        { id: 's4', text: 'Group review at Library Atrium (4:00 PM)', done: false },
      ],
      stickyNote: '📌 Remember to revise!',
      handwrittenReminder: 'Drink plenty of water & get 8h sleep before Thursday exam ✨',
      pageNum: '15',
    },
  },
  {
    id: 'journal',
    tabLabel: 'Journal',
    tabColor: '#B96F52',
    tabBgClass: 'bg-[#B96F52]',
    tabActiveBorder: 'border-[#944D32]',
    leftPage: {
      badge: 'PERSONAL ESSAYS · VOL. II',
      date: 'October 14 · Crisp Morning',
      title: 'Autumn Reflections',
      definition:
        'Woke up early before the neighborhood stirred. Brewed fresh coffee and watched golden leaves drift across the wet pavement. In stillness, scattered thoughts finally find their natural rhythm.',
      bullets: [
        {
          label: 'Morning Walk:',
          text: 'Chilly 52°F air, crisp mist rising above the pond, total absence of street sirens.',
        },
        {
          label: 'Unbroken Flow:',
          text: '90 minutes of pure writing without notifications or inbox checks.',
        },
        {
          label: 'Creative Clarity:',
          text: 'Finally resolved the central theme for the new essays: grounding in simple rituals.',
        },
      ],
      highlightNote: '“Quiet mornings give birth to clear minds and honest intentions.”',
      highlightType: 'terracotta',
      doodle: 'coffee',
      pageNum: '28',
    },
    rightPage: {
      title: 'Gratitude & Intention',
      subtitle: 'Daily Alignment Practice',
      checklist: [
        { id: 'j1', text: 'Warm pour-over coffee by the sunny window', done: true },
        { id: 'j2', text: 'Encouraging voice note from an old university friend', done: true },
        { id: 'j3', text: 'Made steady progress on the NoteSpace architecture', done: true },
        { id: 'j4', text: 'Quiet 20-minute reading session before dinner', done: false },
      ],
      stickyNote: '🌿 Breathe & be present. One conscious step at a time.',
      handwrittenReminder: 'Call Mom this weekend & take an evening walk without headphones ✨',
      pageNum: '29',
    },
  },
  {
    id: 'ideas',
    tabLabel: 'Ideas',
    tabColor: '#D4A373',
    tabBgClass: 'bg-[#D4A373]',
    tabActiveBorder: 'border-[#B8814D]',
    leftPage: {
      badge: 'PRODUCT LAB · EXPLORATION',
      date: 'Sprint Concept v2.4',
      title: 'Project Aurora',
      definition:
        'A tactile digital notebook that respects human cognitive pacing: blending the warmth of heavy cream stationery with sub-50ms instant full-text search and cryptographic privacy.',
      bullets: [
        {
          label: '1. Tactile Simplicity:',
          text: 'Deliberate typography, zero algorithmic feed noise, calm workspace.',
        },
        {
          label: '2. Lightning Search:',
          text: 'Compound MongoDB indexing & client fuzzy caching for immediate recall.',
        },
        {
          label: '3. Data Sovereignty:',
          text: 'Export notes to Markdown, JSON, or printable PDF with zero lock-in.',
        },
      ],
      highlightNote: 'Design thesis: True productivity is about subtracting clutter, not adding more widgets.',
      highlightType: 'amber',
      doodle: 'lightbulb',
      pageNum: '42',
    },
    rightPage: {
      title: 'Feature Brainstorm',
      subtitle: 'Q4 Milestone Planning',
      checklist: [
        { id: 'i1', text: 'Interactive 3D dual-page notebook landing experience', done: true },
        { id: 'i2', text: 'Physical color-coded tabs with 600ms page turns', done: true },
        { id: 'i3', text: 'Bi-directional [[wiki]] note interlinking', done: false },
        { id: 'i4', text: 'Offline-first sync engine with local IndexedDB', done: false },
      ],
      stickyNote: '💡 Test paper prototype with 5 college students on Friday!',
      handwrittenReminder: 'Simplicity is subtracting the obvious and adding the meaningful ✨',
      pageNum: '43',
    },
  },
  {
    id: 'tasks',
    tabLabel: 'Tasks',
    tabColor: '#5C768D',
    tabBgClass: 'bg-[#5C768D]',
    tabActiveBorder: 'border-[#3D5569]',
    leftPage: {
      badge: 'SPRINT 42 · PRODUCTION',
      date: 'Target: Launch Week',
      title: 'Milestones & Goals',
      definition:
        'Delivering a high-performance, enterprise-tested notes platform. Zero mock data, complete MongoDB persistence, verified admin oversight, and delightful tactile polish.',
      bullets: [
        {
          label: 'API Integration:',
          text: '38/38 server test suites passing with 100% schema validation.',
        },
        {
          label: 'Security Suite:',
          text: 'Admin role verification, session revocation, and immutable audit logging.',
        },
        {
          label: 'Responsive Design:',
          text: 'Fluid viewport scaling from 360px phones up to 4K desktop displays.',
        },
      ],
      highlightNote: 'Goal: Zero latency, pure reliability, and an unforgettable first impression.',
      highlightType: 'slate',
      doodle: 'target',
      pageNum: '60',
    },
    rightPage: {
      title: 'Action Pipeline',
      subtitle: 'Today’s High Priority Queue',
      checklist: [
        { id: 't1', text: 'Verify compound indexes on MongoDB note title & tags', done: true },
        { id: 't2', text: 'Audit security cookies & rate-limiting middleware', done: true },
        { id: 't3', text: 'Ship interactive 3D notebook hero with paper tabs', done: true },
        { id: 't4', text: 'Deploy production release bundle to cloud hosting', done: false },
      ],
      stickyNote: '🎯 Inbox Zero achieved at 11:30 AM today!',
      handwrittenReminder: 'Ship with pride, measure with clarity, iterate with empathy ✨',
      pageNum: '61',
    },
  },
];

export function InteractiveNotebook() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<TabCategory>('study');
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Dynamic interactive checklist state per tab
  const [checklists, setChecklists] = useState<Record<string, boolean>>({
    s1: true,
    s2: true,
    s3: false,
    s4: false,
    j1: true,
    j2: true,
    j3: true,
    j4: false,
    i1: true,
    i2: true,
    i3: false,
    i4: false,
    t1: true,
    t2: true,
    t3: true,
    t4: false,
  });

  const toggleCheck = (id: string) => {
    setChecklists((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentIndex = NOTEBOOK_SPREADS.findIndex((s) => s.id === activeTab);
  const currentSpread = NOTEBOOK_SPREADS[currentIndex] || NOTEBOOK_SPREADS[0];

  const handleTabSwitch = (newTab: TabCategory) => {
    if (newTab === activeTab || isFlipping) return;
    const newIdx = NOTEBOOK_SPREADS.findIndex((s) => s.id === newTab);
    const direction = newIdx > currentIndex ? 'forward' : 'backward';

    setTurnDirection(direction);
    setIsFlipping(true);

    setTimeout(() => {
      setActiveTab(newTab);
    }, 280);

    setTimeout(() => {
      setIsFlipping(false);
      setTurnDirection(null);
    }, 600);
  };

  const handleNextPage = () => {
    if (isFlipping) return;
    const nextIdx = (currentIndex + 1) % NOTEBOOK_SPREADS.length;
    handleTabSwitch(NOTEBOOK_SPREADS[nextIdx].id);
  };

  const handlePrevPage = () => {
    if (isFlipping) return;
    const prevIdx = (currentIndex - 1 + NOTEBOOK_SPREADS.length) % NOTEBOOK_SPREADS.length;
    handleTabSwitch(NOTEBOOK_SPREADS[prevIdx].id);
  };

  const handleOpenNotebook = () => {
    if (isAuthenticated) {
      navigate('/notes/new');
    } else {
      navigate('/register');
    }
  };

  // Keyboard accessibility: Left / Right arrow navigation when focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') handleNextPage();
      if (e.key === 'ArrowLeft') handlePrevPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="relative w-full max-w-4xl mx-auto select-none">
      {/* Outer Realistic Leather Desk Pad & Shadow Stack */}
      <div className="relative rounded-2xl p-2.5 sm:p-4 md:p-5 notebook-leather-cover">
        
        {/* Physical Hanging Bookmark Ribbon */}
        <div
          onClick={() => setIsBookmarked(!isBookmarked)}
          title={isBookmarked ? 'Bookmark saved! Click to remove' : 'Click to save bookmark'}
          className={`absolute -top-3 left-16 sm:left-24 z-30 flex flex-col items-center cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 ${
            isBookmarked ? 'translate-y-2' : ''
          }`}
        >
          <div className="w-6 sm:w-7 h-12 sm:h-16 bg-[#B96F52] shadow-md shadow-amber-950/40 relative flex items-center justify-center">
            {/* Satin sheen reflection line */}
            <div className="absolute inset-y-0 left-1 w-0.5 bg-white/30" />
            <Bookmark className={`w-3.5 h-3.5 text-white/90 transition-transform ${isBookmarked ? 'scale-110 fill-white' : ''}`} />
          </div>
          {/* Ribbon fishtail cutout */}
          <div className="w-0 h-0 border-l-[12px] sm:border-l-[14px] border-l-transparent border-r-[12px] sm:border-r-[14px] border-r-transparent border-t-[8px] sm:border-t-[10px] border-t-[#B96F52]" />
        </div>

        {/* Protruding Colored Paper Tabs on Right Side */}
        <div className="absolute -right-3.5 sm:-right-4.5 md:-right-5 top-12 sm:top-16 z-20 flex flex-col gap-2.5 sm:gap-3">
          {NOTEBOOK_SPREADS.map((spread) => {
            const isActive = activeTab === spread.id;
            return (
              <button
                key={spread.id}
                onClick={() => handleTabSwitch(spread.id)}
                aria-label={`Switch to ${spread.tabLabel} tab`}
                style={{ backgroundColor: spread.tabColor }}
                className={`group relative flex items-center justify-center px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-r-lg shadow-md transition-all duration-200 text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#2E221B] ${
                  isActive
                    ? 'translate-x-1.5 sm:translate-x-2 font-semibold shadow-lg shadow-black/20 ring-1 ring-white/50'
                    : 'opacity-85 hover:opacity-100 hover:translate-x-0.5'
                }`}
              >
                {/* Subtle tab fold highlight */}
                <div className="absolute inset-y-0 left-0 w-1 bg-black/15 rounded-l-sm" />
                <span className="tracking-wide uppercase text-[10px] sm:text-xs">
                  {spread.tabLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Two-Page Open Notebook Structure */}
        <div className="relative rounded-lg overflow-hidden notebook-paper-stack bg-[#FAF6EE] border border-[#DDD5C5]">
          
          {/* Subtle multi-page edge stacked layers on left and right */}
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-[#DDD3C2] to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-1.5 bg-gradient-to-l from-[#DDD3C2] to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-t from-[#DDD3C2] to-transparent pointer-events-none z-10" />

          {/* Central Stitched Binding & Crease Shadow */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 pointer-events-none z-20 notebook-center-binding flex flex-col justify-around items-center py-6 opacity-80">
            {/* Realistic stitched binding threads */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3D2C20]/40 shadow-inner" />
                <div className="w-0.5 h-3 bg-[#E8DEC8] opacity-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#3D2C20]/40 shadow-inner" />
              </div>
            ))}
          </div>

          {/* Two Pages Layout Container */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 min-h-[460px] sm:min-h-[500px] md:min-h-[540px] text-[#292821] ${
              isFlipping
                ? turnDirection === 'forward'
                  ? 'animate-page-turn-forward'
                  : 'animate-page-turn-backward'
                : 'transition-opacity duration-300'
            }`}
          >
            {/* LEFT PAGE — Study Notes / Journal / Ideas / Tasks */}
            <div className="relative p-5 sm:p-7 md:p-8 flex flex-col justify-between notebook-left-page notebook-ruled-lines border-b md:border-b-0 md:border-r border-[#E8DEC8]">
              {/* Top Page Header */}
              <div>
                <div className="flex items-center justify-between text-xs text-[#8A7967] mb-2 sm:mb-3 pb-1 border-b border-[#E8DEC8]/80">
                  <span className="font-semibold tracking-wider uppercase text-[10px] sm:text-[11px] text-[#8A7967]">
                    {currentSpread.leftPage.badge}
                  </span>
                  <span className="font-serif italic text-xs text-[#8A7967]">
                    {currentSpread.leftPage.date}
                  </span>
                </div>

                {/* Handwritten / Editorial Heading */}
                <div className="flex items-baseline justify-between gap-2 mb-3">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#292821]">
                    {currentSpread.leftPage.title}
                  </h3>
                  {currentSpread.leftPage.doodle === 'leaf' && (
                    <Leaf className="w-5 h-5 text-[#A6B49A] shrink-0" />
                  )}
                  {currentSpread.leftPage.doodle === 'coffee' && (
                    <Coffee className="w-5 h-5 text-[#B96F52] shrink-0" />
                  )}
                  {currentSpread.leftPage.doodle === 'lightbulb' && (
                    <Lightbulb className="w-5 h-5 text-[#D4A373] shrink-0" />
                  )}
                  {currentSpread.leftPage.doodle === 'target' && (
                    <Target className="w-5 h-5 text-[#5C768D] shrink-0" />
                  )}
                </div>

                {/* Definition Box */}
                <p className="text-xs sm:text-sm text-[#3E3A33] leading-relaxed mb-4 font-sans italic pl-2.5 border-l-2 border-[#D4CBB8]">
                  {currentSpread.leftPage.definition}
                </p>

                {/* Structured Bullets */}
                <div className="space-y-2.5 my-3">
                  {currentSpread.leftPage.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm leading-snug">
                      <span className="font-bold text-[#8A7967] shrink-0 mt-0.5">•</span>
                      <p className="text-[#2C2923]">
                        <strong className="font-semibold text-[#1F1D19]">{b.label} </strong>
                        <span className="text-[#4A443B]">{b.text}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Section: Highlighted Note & Page Number */}
              <div className="mt-4 pt-3">
                <div
                  className={`p-2.5 sm:p-3 rounded text-xs sm:text-[13px] leading-relaxed font-sans mb-3 text-[#22211C] ${
                    currentSpread.leftPage.highlightType === 'sage'
                      ? 'notebook-highlight-sage'
                      : currentSpread.leftPage.highlightType === 'terracotta'
                      ? 'notebook-highlight-terracotta'
                      : currentSpread.leftPage.highlightType === 'amber'
                      ? 'notebook-highlight-amber'
                      : 'notebook-highlight-slate'
                  }`}
                >
                  <p className="font-medium">{currentSpread.leftPage.highlightNote}</p>
                </div>

                {/* Page Number Footer */}
                <div className="flex items-center justify-between text-[11px] text-[#8A7967] pt-2 border-t border-[#E8DEC8]">
                  <span className="font-serif italic">NoteSpace Notebook</span>
                  <span className="font-mono font-medium">{currentSpread.leftPage.pageNum}</span>
                </div>
              </div>
            </div>

            {/* RIGHT PAGE — Weekly Planner / Action Items / Checklist */}
            <div className="relative p-5 sm:p-7 md:p-8 flex flex-col justify-between notebook-right-page notebook-ruled-lines">
              {/* Top Page Header */}
              <div>
                <div className="flex items-center justify-between text-xs text-[#8A7967] mb-2 sm:mb-3 pb-1 border-b border-[#E8DEC8]/80">
                  <span className="font-serif italic text-xs text-[#8A7967]">
                    {currentSpread.rightPage.subtitle}
                  </span>
                  <span className="font-mono text-[11px] text-[#8A7967]">
                    Page {currentSpread.rightPage.pageNum}
                  </span>
                </div>

                {/* Heading with Handwritten Style */}
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#292821]">
                    {currentSpread.rightPage.title}
                  </h3>
                  <span className="text-xs font-handwriting text-lg text-[#B96F52]">
                    today
                  </span>
                </div>

                {/* Mini Weekly Schedule (if available) */}
                {currentSpread.rightPage.schedule && (
                  <div className="grid grid-cols-5 gap-1.5 mb-4 p-2 bg-[#F5EFE3] rounded-md border border-[#E3DAC7] text-[11px]">
                    {currentSpread.rightPage.schedule.map((item) => (
                      <div
                        key={item.day}
                        className={`text-center p-1 rounded transition-colors ${
                          item.done
                            ? 'bg-[#A6B49A]/30 text-[#3C4A35] font-semibold'
                            : 'bg-white/60 text-[#5C5447]'
                        }`}
                      >
                        <div className="text-[10px] text-[#8A7967] uppercase font-bold">{item.day}</div>
                        <div className="truncate text-[10px] mt-0.5">{item.task}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Short Interactive To-Do Checklist */}
                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-semibold tracking-wider uppercase text-[#8A7967] mb-1">
                    Checklist & Priorities
                  </div>
                  {currentSpread.rightPage.checklist.map((item) => {
                    const isChecked = checklists[item.id] ?? item.done;
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className="group flex items-start gap-2.5 text-xs sm:text-sm cursor-pointer p-1 rounded hover:bg-[#F2ECE0] transition-colors"
                      >
                        <button
                          type="button"
                          className="mt-0.5 shrink-0 text-[#8A7967] group-hover:text-[#292821] focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-[#A6B49A] fill-[#A6B49A]/20" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#B5A997]" />
                          )}
                        </button>
                        <span
                          className={`leading-snug transition-all ${
                            isChecked
                              ? 'line-through text-[#8A7967]'
                              : 'text-[#2C2923] font-medium'
                          }`}
                        >
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Section: Realistic Terracotta Sticky Note & Handwritten Reminder */}
              <div className="space-y-3 pt-2">
                {/* Terracotta Sticky Note (tilted -1.5deg with realistic shadow) */}
                <div className="relative p-3 rounded sticky-note-terracotta transform -rotate-1 hover:rotate-0 transition-transform duration-200">
                  {/* Subtle tape strip on top */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-white/40 border border-white/60 backdrop-blur-sm rounded-sm shadow-xs" />
                  <p className="text-xs font-semibold text-[#8C3D21] font-sans">
                    {currentSpread.rightPage.stickyNote}
                  </p>
                </div>

                {/* Handwritten Reminder Note */}
                <div className="pt-1 text-center">
                  <p className="font-handwriting text-base sm:text-lg text-[#554A3E] leading-tight">
                    {currentSpread.rightPage.handwrittenReminder}
                  </p>
                </div>

                {/* Page Number Footer */}
                <div className="flex items-center justify-between text-[11px] text-[#8A7967] pt-2 border-t border-[#E8DEC8]">
                  <span className="font-serif italic">October 2026 Edition</span>
                  <span className="font-mono font-medium">{currentSpread.rightPage.pageNum}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notebook Bottom Controls Bar */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-3 px-2 sm:px-3 text-xs sm:text-sm text-[#DDD5C5]">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrevPage}
              disabled={isFlipping}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#3D2C20] hover:bg-[#4E392B] active:bg-[#2A1D15] text-[#F7F3EB] border border-[#5A4333] transition-all disabled:opacity-50 text-xs font-medium shadow-sm"
              title="Previous spread (Left arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              onClick={handleNextPage}
              disabled={isFlipping}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#3D2C20] hover:bg-[#4E392B] active:bg-[#2A1D15] text-[#F7F3EB] border border-[#5A4333] transition-all disabled:opacity-50 text-xs font-medium shadow-sm"
              title="Next spread (Right arrow)"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Page Indicator */}
          <div className="flex items-center gap-2 text-xs text-[#D8CEBD]">
            <span className="font-mono text-[#F7F3EB] font-semibold">
              Pages {currentSpread.leftPage.pageNum}–{currentSpread.rightPage.pageNum}
            </span>
            <span className="text-[#8A7967]">·</span>
            <span className="capitalize text-[#DDD5C5] font-serif italic">
              {currentSpread.tabLabel} Notes
            </span>
          </div>

          {/* Bookmark State & Open Note CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border transition-all text-xs font-medium ${
                isBookmarked
                  ? 'bg-[#B96F52] text-white border-[#B96F52]'
                  : 'bg-[#3D2C20] text-[#D8CEBD] border-[#5A4333] hover:text-white'
              }`}
              title="Toggle ribbon bookmark"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              onClick={handleOpenNotebook}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-[#B96F52] to-[#A85E42] hover:from-[#C77C5E] hover:to-[#B96F52] text-white font-medium shadow-md shadow-amber-950/20 text-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Write in Notebook</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
