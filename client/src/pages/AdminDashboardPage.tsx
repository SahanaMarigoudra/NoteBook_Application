import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  FileText,
  Calendar,
  Trash2,
  FolderOpen,
  UserPlus,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6'];

export default function AdminDashboardPage() {
  const [days, setDays] = useState<number>(7);
  const { data, isLoading, isRefetching, refetch } = useAdminDashboard(days);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Administrator Overview
            <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/10 text-xs">
              Live MongoDB
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time platform metrics, user analytics, and system activities
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range toggle */}
          <div className="inline-flex rounded-lg border bg-card p-1 shadow-xs">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  days === d
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Last {d}d
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-8 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 8 Statistic Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Total Registered Users */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Users
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.cards.totalUsers.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Registered accounts
            </p>
          </CardContent>
        </Card>

        {/* 2. Active Users */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Users
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.cards.activeUsers.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Active in last 30 days</p>
          </CardContent>
        </Card>

        {/* 3. Total Notes Created */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Notes
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.cards.totalNotes.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Active non-trashed notes</p>
          </CardContent>
        </Card>

        {/* 4. Notes Created Today */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Notes Created Today
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.cards.notesToday.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Since midnight</p>
          </CardContent>
        </Card>

        {/* 5. Notes in Trash */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Notes in Trash
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <Trash2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.cards.notesInTrash.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Soft-deleted items</p>
          </CardContent>
        </Card>

        {/* 6. Total Categories */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Categories
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
              <FolderOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.cards.totalCategories.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Across all users</p>
          </CardContent>
        </Card>

        {/* 7. New Registrations */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              New Registrations
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <UserPlus className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.cards.newRegistrations.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Past {days} days</p>
          </CardContent>
        </Card>

        {/* 8. Recent Alerts & Status */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System Alerts
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {data?.cards.recentAlertsCount === 0 ? (
                  <span className="text-emerald-500 text-lg flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="h-5 w-5" /> All Clean
                  </span>
                ) : (
                  <span className="text-amber-500">{data?.cards.recentAlertsCount} Alerts</span>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {data?.cards.maintenanceMode ? '⚠️ Maintenance Mode Active' : 'Normal Operations'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Notes Created Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Notes Creation Trend
            </CardTitle>
            <CardDescription>Daily note generation over the past {days} days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !data?.charts.notesCreated.length ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No notes created in this period
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts.notesCreated}>
                    <defs>
                      <linearGradient id="noteGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => {
                        try {
                          return format(new Date(d), 'MMM d');
                        } catch {
                          return d;
                        }
                      }}
                      fontSize={11}
                    />
                    <YAxis allowDecimals={false} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Notes Created"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#noteGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: User Registrations Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-500" />
              User Registrations Trend
            </CardTitle>
            <CardDescription>Daily new user sign-ups over the past {days} days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !data?.charts.userRegistrations.length ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No user registrations recorded in this period
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.userRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => {
                        try {
                          return format(new Date(d), 'MMM d');
                        } catch {
                          return d;
                        }
                      }}
                      fontSize={11}
                    />
                    <YAxis allowDecimals={false} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="New Users"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 3: Distribution of Notes by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-500" />
              Notes by Category
            </CardTitle>
            <CardDescription>Breakdown of active notes across top categories</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !data?.charts.categoryDistribution.length ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No categorized notes found
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.charts.categoryDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {data.charts.categoryDistribution.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={entry.color || PRESET_COLORS[idx % PRESET_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 4: Account Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              Account Status Breakdown
            </CardTitle>
            <CardDescription>Active vs inactive vs suspended user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.charts.accountStatusBreakdown}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis type="number" allowDecimals={false} fontSize={11} />
                    <YAxis dataKey="name" type="category" width={110} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Accounts" radius={[0, 4, 4, 0]}>
                      {data?.charts.accountStatusBreakdown.map((entry, idx) => (
                        <Cell key={`bar-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Recent Administrative Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recent Administrative Activity
          </CardTitle>
          <CardDescription>Latest system security events, role changes, and actions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data?.recentActivity.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent administrative actions recorded.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-2 font-medium">Timestamp</th>
                    <th className="pb-2 font-medium">Administrator</th>
                    <th className="pb-2 font-medium">Action</th>
                    <th className="pb-2 font-medium">Target</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.recentActivity.map((log) => (
                    <tr key={log._id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </td>
                      <td className="py-2.5 font-medium">{log.actorEmail}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-2.5 capitalize text-muted-foreground">
                        {log.targetType} {log.targetId ? `(${log.targetId.slice(-6)})` : ''}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            log.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
