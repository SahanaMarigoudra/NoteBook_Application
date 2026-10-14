import React, { useState } from 'react';
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
  Clock,
  Terminal,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAdminAuditLogs } from '@/hooks/useAdmin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminAuditLog } from '@/types';

export default function AdminActivityLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const { data, isLoading } = useAdminAuditLogs({
    search,
    action: actionFilter || undefined,
    targetType: targetTypeFilter,
    page,
    limit: 15,
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Activity Logs & Audit Trail
          </h1>
          <p className="text-sm text-muted-foreground">
            Immutable, append-only record of administrative operations, security changes, and privacy content accesses
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by administrator email or reason..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
            >
              <option value="">All Actions</option>
              <option value="user_role_change">Role Change</option>
              <option value="user_status_change">Status Change</option>
              <option value="user_delete">User Deletion</option>
              <option value="note_delete">Note Deletion</option>
              <option value="note_view_content">Privacy Content View</option>
              <option value="category_delete">Category Deletion</option>
              <option value="tag_delete">Tag Deletion</option>
              <option value="settings_update">Settings Update</option>
              <option value="system_action">System Action</option>
            </select>

            <select
              value={targetTypeFilter}
              onChange={(e) => {
                setTargetTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
            >
              <option value="all">All Targets</option>
              <option value="user">User</option>
              <option value="note">Note</option>
              <option value="category">Category</option>
              <option value="tag">Tag</option>
              <option value="settings">Settings</option>
              <option value="system">System</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Administrator</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Target</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">IP Address</th>
                  <th className="px-5 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-5 py-3.5">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                ) : !data?.logs.length ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      No audit events match your search.
                    </td>
                  </tr>
                ) : (
                  data.logs.map((log) => (
                    <tr key={log._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3 font-medium text-foreground">{log.actorEmail}</td>

                      <td className="px-5 py-3">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-tight">
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </td>

                      <td className="px-5 py-3 capitalize text-muted-foreground">
                        <span className="font-medium text-foreground">{log.targetType}</span>
                        {log.targetId ? ` (${log.targetId.slice(-6)})` : ''}
                      </td>

                      <td className="px-5 py-3">
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

                      <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">
                        {log.ipAddress || '—'}
                      </td>

                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedLog(log)}
                          title="View Audit Event Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
              <span>
                Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total logs)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="h-7 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Log Detail Viewer Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Audit Event #{selectedLog?._id.slice(-8)}
            </DialogTitle>
            <DialogDescription>
              {selectedLog && format(new Date(selectedLog.createdAt), 'PPP p')}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/20 p-3">
                <div>
                  <span className="text-muted-foreground block">Actor:</span>
                  <span className="font-semibold text-foreground">{selectedLog.actorEmail}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Action:</span>
                  <span className="font-mono font-semibold text-foreground uppercase">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Target Type:</span>
                  <span className="font-semibold capitalize text-foreground">{selectedLog.targetType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">IP Address:</span>
                  <span className="font-mono text-foreground">{selectedLog.ipAddress || 'Internal'}</span>
                </div>
              </div>

              {selectedLog.reason && (
                <div className="rounded-lg border bg-amber-500/10 border-amber-500/20 p-3 text-amber-600 dark:text-amber-400">
                  <span className="font-semibold block mb-0.5">Stated Justification:</span>
                  <p>{selectedLog.reason}</p>
                </div>
              )}

              {selectedLog.details && (
                <div>
                  <span className="text-muted-foreground block mb-1 font-medium">Metadata Payload:</span>
                  <pre className="rounded-lg border bg-slate-950 text-slate-100 p-3 font-mono text-[11px] overflow-x-auto max-h-48">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
