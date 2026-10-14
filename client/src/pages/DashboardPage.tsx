import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Pin,
  Star,
  Archive,
  Trash2,
  TrendingUp,
  Calendar,
  BookOpen,
  Search,
  Tag,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  BarChart3,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthContext';
import { useDashboardSummary, useActivityChart } from '@/hooks/useDashboard';
import { useCreateNote } from '@/hooks/useNotes';
import { useCategories } from '@/hooks/useCategories';
import { NOTEBOOK_TEMPLATES, NotebookTemplate } from '@/data/notebookTemplates';
import { NotebookStudioModal } from '@/components/dashboard/NotebookStudioModal';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className={`h-8 w-8 rounded-md flex items-center justify-center ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-7 w-12" />
      </CardContent>
    </Card>
  );
}

const dashboardFeatures = [
  {
    icon: FileText,
    title: 'Rich Notes',
    badge: 'Core Feature',
    desc: 'Browse, filter, and organize your complete personal notes archive.',
    link: '/notes',
    actionText: 'View Notes',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Search,
    title: 'Sub-50ms Search',
    badge: 'Instant Recall',
    desc: 'Perform lightning-fast full-text search with relevance ranking.',
    link: '/search',
    actionText: 'Search Notes',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
  },
  {
    icon: Tag,
    title: 'Categories & Tags',
    badge: 'Deep Structure',
    desc: 'Maintain unlimited color-coded categories and descriptive tags.',
    link: '/categories',
    actionText: 'Manage Taxonomy',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    icon: Archive,
    title: 'Archive & Trash',
    badge: 'Safe Storage',
    desc: 'Restore soft-deleted items or browse archived inactive thoughts.',
    link: '/archive',
    actionText: 'Browse Archive',
    color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    badge: 'Insights',
    desc: 'Inspect note creation velocity, trends, and category shares.',
    link: '#activity-chart',
    actionText: 'View Trends',
    color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
  },
  {
    icon: Shield,
    title: 'Security & Access',
    badge: 'Enterprise Grade',
    desc: 'Manage session tokens, device security, and profile settings.',
    link: '/settings',
    actionText: 'Security Settings',
    color: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const [days, setDays] = useState<7 | 30>(7);
  const { data: chart, isLoading: chartLoading } = useActivityChart(days);
  const { data: categories } = useCategories();
  const createNote = useCreateNote();

  // Studio Modal State
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioInitialTab, setStudioInitialTab] = useState<'study' | 'journal' | 'ideas' | 'tasks'>('study');
  const [quickCreatingId, setQuickCreatingId] = useState<string | null>(null);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = summary?.stats;

  // Handle Quick Create directly into MongoDB
  const handleQuickCreate = async (tpl: NotebookTemplate) => {
    try {
      setQuickCreatingId(tpl.id);
      const matchedCat = categories?.find(
        (c) => c.name.toLowerCase() === tpl.suggestedCategory.toLowerCase()
      );

      const newNote = await createNote.mutateAsync({
        title: tpl.defaultTitle,
        content: tpl.defaultContent,
        categoryId: matchedCat?._id ?? null,
        isPinned: tpl.id === 'study',
        isFavorite: tpl.id === 'journal',
      });

      toast.success(`✨ Created ${tpl.name} note in MongoDB!`);
      navigate(`/notes/${newNote._id}/edit`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to create note in database');
    } finally {
      setQuickCreatingId(null);
    }
  };

  const handleOpenStudio = (tab: 'study' | 'journal' | 'ideas' | 'tasks' = 'study') => {
    setStudioInitialTab(tab);
    setStudioOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting()}, {user?.name?.split(' ')[0]}!
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              <Sparkles className="w-3 h-3" />
              NoteSpace Active
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · Here's your workspace overview and notebook studio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => handleOpenStudio('study')}
            className="border-primary/30 hover:bg-primary/5 text-primary font-medium"
          >
            <BookOpen className="h-4 w-4 mr-2 text-primary" />
            Notebook Studio
          </Button>

          <Button asChild className="shadow-sm font-semibold">
            <Link to="/notes/new">
              <Plus className="h-4 w-4 mr-2" /> New Note
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Interactive Notebook Studio & Templates Banner */}
      <Card className="border border-border/80 bg-gradient-to-br from-card via-card to-accent/20 shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-[#3D2C20] flex items-center justify-center text-[#F7F3EB] shadow-xs">
                <BookOpen className="h-5 w-5 text-[#D4A373]" />
              </div>
              <div>
                <CardTitle className="text-lg font-serif font-bold tracking-tight">
                  Notebook Studio & Formats
                </CardTitle>
                <CardDescription className="text-xs">
                  Create structured notes directly using the 4 tactile stationery templates from the landing page.
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenStudio('study')}
              className="text-xs h-8 border-border hover:bg-accent"
            >
              <span>Open 3D Canvas</span>
              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {NOTEBOOK_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="group relative rounded-xl border border-border/70 bg-card p-4 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      style={{ backgroundColor: `${tpl.color}20`, color: tpl.color, borderColor: `${tpl.color}40` }}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md border"
                    >
                      {tpl.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenStudio(tpl.id)}
                      className="text-muted-foreground hover:text-foreground text-xs"
                      title="Preview in 3D Notebook"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h3 className="font-serif text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {tpl.tagline}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Button
                    size="sm"
                    onClick={() => handleQuickCreate(tpl)}
                    disabled={quickCreatingId === tpl.id}
                    className="w-full text-xs h-8 bg-primary/10 hover:bg-primary/20 text-primary font-medium border border-primary/20"
                  >
                    {quickCreatingId === tpl.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3 mr-1.5" />
                        <span>Quick Create in DB</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full text-xs h-7 text-muted-foreground hover:text-foreground justify-center"
                  >
                    <Link to={`/notes/new?template=${tpl.id}`}>
                      <span>Open in Full Editor</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Stat Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Database Metrics
          </h2>
          <span className="text-xs text-muted-foreground">Real-time MongoDB counts</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaryLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                icon={FileText}
                label="Active Notes"
                value={stats?.totalActive ?? 0}
                color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              />
              <StatCard
                icon={Pin}
                label="Pinned Notes"
                value={stats?.totalPinned ?? 0}
                color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              />
              <StatCard
                icon={Star}
                label="Favorites"
                value={stats?.totalFavorite ?? 0}
                color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
              />
              <StatCard
                icon={Calendar}
                label="Created This Week"
                value={stats?.createdThisWeek ?? 0}
                color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              />
              <StatCard
                icon={Archive}
                label="Archived"
                value={stats?.totalArchived ?? 0}
                color="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              />
              <StatCard
                icon={Trash2}
                label="In Trash"
                value={stats?.totalTrashed ?? 0}
                color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              />
            </>
          )}
        </div>
      </div>

      {/* 4. Activity Chart & Category Distribution */}
      <div id="activity-chart" className="grid gap-6 lg:grid-cols-3">
        {/* Activity chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Activity & Creation Velocity</CardTitle>
              <CardDescription className="text-xs">
                Visualizing notes created and modified over time
              </CardDescription>
            </div>
            <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v) as 7 | 30)}>
              <TabsList className="h-7">
                <TabsTrigger value="7" className="text-xs px-2 py-1">7 days</TabsTrigger>
                <TabsTrigger value="30" className="text-xs px-2 py-1">30 days</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : !chart || chart.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                No activity yet. Start creating notes from the templates above!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={chart} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUpdated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => format(new Date(d), 'MMM d')}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelFormatter={(l) => format(new Date(l), 'MMMM d, yyyy')}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="note_created"
                    name="Created"
                    stroke="#6366f1"
                    fill="url(#colorCreated)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="note_updated"
                    name="Updated"
                    stroke="#22c55e"
                    fill="url(#colorUpdated)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Notes by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">By Category</CardTitle>
            <CardDescription className="text-xs">Top categories by note count</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : !summary?.byCategory || summary.byCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories yet.{' '}
                <Link to="/categories" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {summary.byCategory.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} />
                      <span className="text-sm">{cat.name}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{cat.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. Core Features Quick-Launcher Suite (from Landing Page) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              NoteSpace Features Suite
            </h2>
            <p className="text-xs text-muted-foreground">
              Quick access to all core platform modules verified on your account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="rounded-xl border border-border/80 bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${feat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {feat.desc}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-between text-xs h-7 text-primary hover:bg-primary/5 px-2"
                >
                  <Link to={feat.link}>
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Recent Notes Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recently Updated</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !summary?.recentlyUpdated?.length ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <div className="space-y-1">
                {summary.recentlyUpdated.map((note) => (
                  <Link
                    key={note._id}
                    to={`/notes/${note._id}`}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors group"
                  >
                    <span className="truncate font-medium flex-1 group-hover:text-primary transition-colors">
                      {note.title}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recently Created</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !summary?.recentlyCreated?.length ? (
              <p className="text-sm text-muted-foreground">
                No notes yet.{' '}
                <Link to="/notes/new" className="text-primary hover:underline">
                  Create your first!
                </Link>
              </p>
            ) : (
              <div className="space-y-1">
                {summary.recentlyCreated.map((note) => (
                  <Link
                    key={note._id}
                    to={`/notes/${note._id}`}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors group"
                  >
                    <span className="truncate font-medium flex-1 group-hover:text-primary transition-colors">
                      {note.title}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 7. Mount Notebook Studio Modal */}
      <NotebookStudioModal
        open={studioOpen}
        onOpenChange={setStudioOpen}
        initialTemplate={studioInitialTab}
      />
    </div>
  );
}
