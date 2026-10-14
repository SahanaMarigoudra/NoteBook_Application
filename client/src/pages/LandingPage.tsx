import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  StickyNote,
  Search,
  Archive,
  Tag,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  BookOpen,
  FolderOpen,
  CheckCircle2,
  Lock,
  Layers,
  BarChart3,
  PenTool,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { NotebookHero } from '@/components/landing/NotebookHero';

const features = [
  {
    icon: StickyNote,
    title: 'Rich Editorial Notes',
    desc: 'Craft structured notes with titles, rich content, pinned highlights, and color-coded themes that bring clarity to your thinking.',
    tag: 'Core Feature',
    tagColor: 'bg-[#A6B49A]/20 text-[#3C4A35] border-[#A6B49A]/30',
  },
  {
    icon: Search,
    title: 'Sub-50ms Full-Text Search',
    desc: 'Indexed search across your entire notebook with instant text relevance scoring. Find any concept or phrase in milliseconds.',
    tag: 'Instant Recall',
    tagColor: 'bg-[#B96F52]/15 text-[#8C3D21] border-[#B96F52]/25',
  },
  {
    icon: Tag,
    title: 'Categories & Tag Matrix',
    desc: 'Organize notes seamlessly with multi-label tagging and color-coded categories tailored for study, work, or creative projects.',
    tag: 'Deep Structure',
    tagColor: 'bg-[#D4A373]/20 text-[#6B4E26] border-[#D4A373]/30',
  },
  {
    icon: Archive,
    title: 'Archive & Trash Lifecycles',
    desc: 'Keep your desk clean without anxiety. Archive inactive items or send them to soft-trash with instant one-click restoration.',
    tag: 'Safe Storage',
    tagColor: 'bg-[#5C768D]/15 text-[#2C4155] border-[#5C768D]/25',
  },
  {
    icon: BarChart3,
    title: 'Live MongoDB Analytics',
    desc: 'Visualize note volume trends, category distributions, and daily activity habits with integrated interactive charts.',
    tag: 'Insights',
    tagColor: 'bg-[#8A7967]/15 text-[#4D3F33] border-[#8A7967]/25',
  },
  {
    icon: Shield,
    title: 'Cryptographic Security',
    desc: 'Dual-token authentication with 15-minute JWTs, rotating HttpOnly refresh cookies, bcrypt hashing, and admin audit logging.',
    tag: 'Enterprise Grade',
    tagColor: 'bg-[#3D2C20]/10 text-[#251A13] border-[#3D2C20]/20',
  },
];

const templates = [
  {
    category: 'Study Notes',
    title: 'Academic Lecture & Synthesis',
    badge: 'Study',
    color: '#A6B49A',
    description: 'Organize complex topics with concise definitions, key mechanisms, summary highlights, and study flashcard lists.',
    bullets: ['Topic breakdown', 'Core definitions', 'Exam checklist'],
  },
  {
    category: 'Daily Journal',
    title: 'Morning Reflections & Alignment',
    badge: 'Journal',
    color: '#B96F52',
    description: 'Ground yourself with quiet morning thoughts, gratitude practices, mood awareness, and evening intentions.',
    bullets: ['Daily gratitude', 'Mindful reflection', 'Habit tracker'],
  },
  {
    category: 'Idea Lab',
    title: 'Product Concept & Feature Canvas',
    badge: 'Ideas',
    color: '#D4A373',
    description: 'Turn fleeting inspirations into structured execution plans with hypotheses, user stories, and priority nodes.',
    bullets: ['Design hypothesis', 'Core pillars', 'Milestone brainstorm'],
  },
  {
    category: 'Sprint Tasks',
    title: 'Weekly Action Matrix',
    badge: 'Tasks',
    color: '#5C768D',
    description: 'Stay ahead of deadlines with high-impact checklists, daily time blocks, and milestone tracking.',
    bullets: ['Priority queue', 'Daily checklist', 'Weekly review'],
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCreateNote = () => {
    if (isAuthenticated) {
      navigate('/notes/new');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EB] text-[#292821] flex flex-col font-sans selection:bg-[#B96F52]/20 selection:text-[#B96F52]">
      {/* 1. Warm Editorial Navigation Bar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Interactive Open-Notebook Hero Section */}
        <NotebookHero />

        {/* 3. Features Section: "Designed Around The Way You Think" */}
        <section id="features" className="py-20 sm:py-28 border-t border-[#E8DEC8] bg-[#FAF7F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold tracking-widest text-[#B96F52] uppercase font-sans">
                Intentional Architecture
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#292821] mt-2 mb-4">
                Designed Around the Way You Think
              </h2>
              <p className="text-base sm:text-lg text-[#554A3E] leading-relaxed">
                Everything you need to write, discover, and organize your ideas with the tactility of stationery and the power of modern engineering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map(({ icon: Icon, title, desc, tag, tagColor }) => (
                <div
                  key={title}
                  className="group relative rounded-xl border border-[#E3DAC7] bg-[#FFFCF5] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#F5EFE3] flex items-center justify-center text-[#B96F52] group-hover:scale-105 transition-transform border border-[#E5DEC9]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${tagColor}`}>
                      {tag}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#292821] mb-2 group-hover:text-[#B96F52] transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-[#554A3E] leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Templates Section: "Four Modes For Every State of Mind" */}
        <section id="templates" className="py-20 sm:py-28 border-t border-[#E8DEC8] bg-[#F7F3EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
              <div>
                <span className="text-xs font-semibold tracking-widest text-[#B96F52] uppercase font-sans">
                  Ready-Made Structures
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#292821] mt-2">
                  Four Modes for Every State of Mind
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#554A3E] max-w-md">
                Jump straight into structured thought without staring at a blank screen. Click to open any notebook template.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((tpl) => (
                <div
                  key={tpl.category}
                  className="rounded-xl border border-[#E3DAC7] bg-[#FFFCF5] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all hover:border-[#D0C6B3]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        style={{ backgroundColor: `${tpl.color}20`, color: tpl.color, borderColor: `${tpl.color}40` }}
                        className="text-xs font-semibold px-2.5 py-1 rounded-md border"
                      >
                        {tpl.badge}
                      </span>
                      <Sparkles className="w-4 h-4 text-[#8A7967]" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#292821] mb-2">
                      {tpl.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#554A3E] leading-relaxed mb-4">
                      {tpl.description}
                    </p>
                    <ul className="space-y-1.5 text-xs text-[#6B5E4F] mb-6">
                      {tpl.bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#A6B49A] shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNote}
                    className="w-full justify-center border-[#DDD3C2] hover:bg-[#F2ECE0] text-[#292821] text-xs font-medium"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3 h-3 ml-1.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Philosophy / Editorial Quote Banner */}
        <section id="philosophy" className="py-20 sm:py-24 border-t border-[#E8DEC8] bg-[#F1EAE0] relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <span className="text-3xl font-serif text-[#B96F52] opacity-60">“</span>
            <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-[#292821] leading-snug tracking-tight mb-6">
              A digital notebook that honors human pacing. No algorithmic noise, no tracking feeds—just you, your thoughts, and a pristine page.
            </blockquote>
            <p className="text-xs sm:text-sm text-[#8A7967] uppercase tracking-widest font-semibold">
              The NoteSpace Manifesto · Designed for Clarity
            </p>

            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                onClick={handleCreateNote}
                className="bg-[#B96F52] hover:bg-[#A35D42] text-white shadow-md font-semibold px-8 h-12"
              >
                <span>Begin Your Notebook</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Editorial Footer */}
      <footer className="border-t border-[#E8DEC8] bg-[#FAF7F0] py-12 text-sm text-[#554A3E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E8DEC8]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3D2C20] flex items-center justify-center text-[#F7F3EB]">
                <BookOpen className="w-4 h-4 text-[#D4A373]" />
              </div>
              <span className="font-serif text-lg font-bold text-[#292821]">NoteSpace</span>
              <span className="text-xs text-[#8A7967] font-mono">v1.2</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#554A3E]">
              <a href="#" className="hover:text-[#B96F52] transition-colors">Home</a>
              <a href="#features" className="hover:text-[#B96F52] transition-colors">Features</a>
              <a href="#templates" className="hover:text-[#B96F52] transition-colors">Templates</a>
              <a href="#philosophy" className="hover:text-[#B96F52] transition-colors">Philosophy</a>
              <Link to="/login" className="hover:text-[#B96F52] transition-colors">Sign In</Link>
              <Link to="/admin/login" className="hover:text-[#B96F52] transition-colors text-xs text-[#8A7967]">Admin Portal</Link>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7967]">
            <p>© {new Date().getFullYear()} NoteSpace — All rights reserved. Built with MongoDB, Express, React, and TypeScript.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] text-[#554A3E]">System Status: Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
