import React, { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
  FileText,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  useAdminUsers,
  useAdminUserDetails,
  useUpdateUserRole,
  useUpdateUserStatus,
  useDeleteAdminUser,
} from '@/hooks/useAdmin';
import { useAuth } from '@/features/auth/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [detailsUserId, setDetailsUserId] = useState<string | null>(null);
  const [roleChangeUser, setRoleChangeUser] = useState<{ id: string; name: string; currentRole: string } | null>(null);
  const [statusChangeUser, setStatusChangeUser] = useState<{ id: string; name: string; currentStatus: string } | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<{ id: string; name: string; email: string } | null>(null);

  const { data, isLoading, isFetching } = useAdminUsers({
    search,
    role: roleFilter,
    status: statusFilter,
    page,
    limit: 10,
    sort: sortField,
    order: sortOrder,
  });

  const { data: userDetails, isLoading: detailsLoading } = useAdminUserDetails(detailsUserId);

  const roleMutation = useUpdateUserRole();
  const statusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteAdminUser();

  const handleRoleSubmit = async (newRole: 'user' | 'admin') => {
    if (!roleChangeUser) return;
    try {
      await roleMutation.mutateAsync({ userId: roleChangeUser.id, role: newRole });
      toast.success(`Role updated to ${newRole}`);
      setRoleChangeUser(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update role');
    }
  };

  const handleStatusSubmit = async (newStatus: 'active' | 'suspended') => {
    if (!statusChangeUser) return;
    try {
      await statusMutation.mutateAsync({ userId: statusChangeUser.id, status: newStatus });
      toast.success(`Account ${newStatus === 'active' ? 'activated' : 'suspended'}`);
      setStatusChangeUser(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteUserTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteUserTarget.id);
      toast.success(`Account for ${deleteUserTarget.email} permanently deleted`);
      setDeleteUserTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            View accounts, assign administrative roles, manage statuses, and audit note ownership
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
            >
              <option value="all">All Roles</option>
              <option value="user">Standard Users</option>
              <option value="admin">Administrators</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Sort Field */}
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-');
                setSortField(f);
                setSortOrder(o as 'asc' | 'desc');
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="lastActiveAt-desc">Recently Active</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Notes</th>
                  <th className="px-6 py-3.5">Registered</th>
                  <th className="px-6 py-3.5">Last Active</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : !data?.users.length ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No users match your current search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  data.users.map((u) => {
                    const isSelf = currentAdmin?._id === u._id;
                    return (
                      <tr key={u._id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate flex items-center gap-1.5">
                                {u.name}
                                {isSelf && (
                                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-normal">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {u.role === 'admin' ? (
                            <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 gap-1 text-[11px]">
                              <ShieldCheck className="h-3 w-3" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[11px] text-muted-foreground">
                              User
                            </Badge>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {u.status === 'suspended' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs">{u.noteCount ?? 0}</td>

                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(u.createdAt), 'MMM d, yyyy')}
                        </td>

                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {u.lastActiveAt
                            ? formatDistanceToNow(new Date(u.lastActiveAt), { addSuffix: true })
                            : 'Never'}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => setDetailsUserId(u._id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details & Stats
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() =>
                                  setRoleChangeUser({ id: u._id, name: u.name, currentRole: u.role || 'user' })
                                }
                                disabled={isSelf}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                {u.role === 'admin' ? 'Revoke Admin Role' : 'Make Administrator'}
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusChangeUser({
                                    id: u._id,
                                    name: u.name,
                                    currentStatus: u.status || 'active',
                                  })
                                }
                                disabled={isSelf}
                              >
                                {u.status === 'suspended' ? (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2 text-emerald-500" />
                                    Activate Account
                                  </>
                                ) : (
                                  <>
                                    <UserX className="h-4 w-4 mr-2 text-amber-500" />
                                    Suspend Account
                                  </>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() =>
                                  setDeleteUserTarget({ id: u._id, name: u.name, email: u.email })
                                }
                                disabled={isSelf}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
              <span>
                Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total users)
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

      {/* User Details Modal */}
      <Dialog open={!!detailsUserId} onOpenChange={(open) => !open && setDetailsUserId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              User Account Details
            </DialogTitle>
            <DialogDescription>Overview and database statistics for this user</DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : userDetails ? (
            <div className="space-y-4 py-2 text-sm">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-base font-bold text-primary">
                  {userDetails.user.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{userDetails.user.name}</h4>
                  <p className="text-xs text-muted-foreground">{userDetails.user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {userDetails.user.role}
                    </Badge>
                    <Badge
                      className={
                        userDetails.user.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500 text-[10px]'
                          : 'bg-rose-500/10 text-rose-500 text-[10px]'
                      }
                    >
                      {userDetails.user.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg border p-2.5">
                  <p className="text-xs text-muted-foreground">Active Notes</p>
                  <p className="text-xl font-bold mt-0.5">{userDetails.stats.noteCount}</p>
                </div>
                <div className="rounded-lg border p-2.5">
                  <p className="text-xs text-muted-foreground">Trashed Notes</p>
                  <p className="text-xl font-bold mt-0.5">{userDetails.stats.trashedNoteCount}</p>
                </div>
                <div className="rounded-lg border p-2.5">
                  <p className="text-xs text-muted-foreground">Categories</p>
                  <p className="text-xl font-bold mt-0.5">{userDetails.stats.categoryCount}</p>
                </div>
                <div className="rounded-lg border p-2.5">
                  <p className="text-xs text-muted-foreground">Tags</p>
                  <p className="text-xl font-bold mt-0.5">{userDetails.stats.tagCount}</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-1.5 text-xs text-muted-foreground rounded-lg border bg-muted/10 p-3">
                <div className="flex justify-between">
                  <span>Registered:</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(userDetails.user.createdAt), 'PPP p')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Active:</span>
                  <span className="font-medium text-foreground">
                    {userDetails.user.lastActiveAt
                      ? format(new Date(userDetails.user.lastActiveAt), 'PPP p')
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsUserId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={!!roleChangeUser} onOpenChange={(open) => !open && setRoleChangeUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the role of <strong>{roleChangeUser?.name}</strong> to{' '}
              <strong>{roleChangeUser?.currentRole === 'admin' ? 'Standard User' : 'Administrator'}</strong>?
              {roleChangeUser?.currentRole !== 'admin' && (
                <span className="block mt-2 text-amber-500">
                  ⚠️ This grants full administrative access to all system data, users, and settings.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleRoleSubmit(roleChangeUser?.currentRole === 'admin' ? 'user' : 'admin')
              }
            >
              Confirm Role Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Toggle Dialog */}
      <AlertDialog open={!!statusChangeUser} onOpenChange={(open) => !open && setStatusChangeUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusChangeUser?.currentStatus === 'suspended' ? 'Activate Account' : 'Suspend Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusChangeUser?.currentStatus === 'suspended' ? (
                <>Restore login privileges and access for <strong>{statusChangeUser?.name}</strong>?</>
              ) : (
                <>
                  Suspending <strong>{statusChangeUser?.name}</strong> will instantly terminate all active login
                  sessions and block further authentication until reactivated.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleStatusSubmit(statusChangeUser?.currentStatus === 'suspended' ? 'active' : 'suspended')
              }
              className={
                statusChangeUser?.currentStatus === 'suspended'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              {statusChangeUser?.currentStatus === 'suspended' ? 'Activate Account' : 'Suspend Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!deleteUserTarget} onOpenChange={(open) => !open && setDeleteUserTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Permanently Delete User Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to permanently delete the account for{' '}
                <strong>{deleteUserTarget?.email}</strong>.
              </p>
              <p className="text-destructive font-medium">
                This action is IRREVERSIBLE. All of the user's notes, categories, tags, and sessions will be deleted immediately.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubmit}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete User Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
