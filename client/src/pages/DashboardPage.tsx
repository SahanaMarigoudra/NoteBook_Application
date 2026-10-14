import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Pin, Star, Archive, Trash2, TrendingUp, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthContext';
import { useDashboardSummary, useActivityChart } from '@/hooks/useDashboard';

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
}) {
  return (
    <Card>
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
  return <Card><CardContent className="p-5"><Skeleton className="h-4 w-20 mb-3" /><Skeleton className="h-7 w-12" /></CardContent></Card>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const [days, setDays] = useState<7 | 30>(7);
  const { data: chart, isLoading: chartLoading } = useActivityChart(days);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = summary?.stats;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{greeting()}, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d')} · Here's what's happening with your notes.
          </p>
        </div>
        <Button asChild>
          <Link to="/notes/new">
            <Plus className="h-4 w-4 mr-2" /> New Note
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard icon={FileText} label="Active Notes" value={stats?.totalActive ?? 0} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
            <StatCard icon={Pin} label="Pinned Notes" value={stats?.totalPinned ?? 0} color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
            <StatCard icon={Star} label="Favorites" value={stats?.totalFavorite ?? 0} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
            <StatCard icon={Calendar} label="Created This Week" value={stats?.createdThisWeek ?? 0} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
            <StatCard icon={Archive} label="Archived" value={stats?.totalArchived ?? 0} color="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" />
            <StatCard icon={Trash2} label="In Trash" value={stats?.totalTrashed ?? 0} color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Activity</CardTitle>
              <CardDescription>Notes created and updated over time</CardDescription>
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
              <Skeleton className="h-48 w-full" />
            ) : !chart || chart.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No activity yet. Start creating notes!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
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
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(l) => format(new Date(l), 'MMMM d, yyyy')}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="note_created" name="Created" stroke="#6366f1" fill="url(#colorCreated)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="note_updated" name="Updated" stroke="#22c55e" fill="url(#colorUpdated)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Notes by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Category</CardTitle>
            <CardDescription>Top categories by note count</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
            ) : !summary?.byCategory || summary.byCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet. <Link to="/categories" className="text-primary hover:underline">Create one</Link></p>
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

      {/* Recent notes */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recently Updated</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : !summary?.recentlyUpdated?.length ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <div className="space-y-1">
                {summary.recentlyUpdated.map((note) => (
                  <Link key={note._id} to={`/notes/${note._id}`} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors group">
                    <span className="truncate font-medium flex-1">{note.title}</span>
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
            <CardTitle className="text-base">Recently Created</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : !summary?.recentlyCreated?.length ? (
              <p className="text-sm text-muted-foreground">No notes yet. <Link to="/notes/new" className="text-primary hover:underline">Create your first!</Link></p>
            ) : (
              <div className="space-y-1">
                {summary.recentlyCreated.map((note) => (
                  <Link key={note._id} to={`/notes/${note._id}`} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors">
                    <span className="truncate font-medium flex-1">{note.title}</span>
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
    </div>
  );
}
