import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  AdminDashboardData,
  AdminUser,
  Pagination,
  Note,
  Category,
  Tag,
  AdminAuditLog,
  AdminSystemSettings,
  AdminSystemInfo,
} from '@/types';

/**
 * 1. Admin Dashboard
 */
export function useAdminDashboard(days: number = 7) {
  return useQuery({
    queryKey: ['admin', 'dashboard', days],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: AdminDashboardData }>(
        `/admin/dashboard?days=${days}`
      );
      return data.data;
    },
    refetchInterval: 30000, // Background refresh every 30s
  });
}

/**
 * 2. User Management
 */
export function useAdminUsers(params: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.role) searchParams.set('role', params.role);
      if (params.status) searchParams.set('status', params.status);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.sort) searchParams.set('sort', params.sort);
      if (params.order) searchParams.set('order', params.order);

      const { data } = await api.get<{
        success: boolean;
        data: { users: AdminUser[]; pagination: Pagination };
      }>(`/admin/users?${searchParams.toString()}`);
      return data.data;
    },
  });
}

export function useAdminUserDetails(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'user-details', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await api.get<{
        success: boolean;
        data: {
          user: AdminUser;
          stats: { noteCount: number; trashedNoteCount: number; categoryCount: number; tagCount: number };
          recentNotes: Note[];
        };
      }>(`/admin/users/${userId}`);
      return data.data;
    },
    enabled: !!userId,
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'admin' }) => {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'active' | 'suspended' }) => {
      const { data } = await api.patch(`/admin/users/${userId}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/admin/users/${userId}`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

/**
 * 3. Notes Management
 */
export function useAdminNotes(params: {
  search?: string;
  status?: string;
  userId?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'notes', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.status) searchParams.set('status', params.status);
      if (params.userId) searchParams.set('userId', params.userId);
      if (params.categoryId) searchParams.set('categoryId', params.categoryId);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));

      const { data } = await api.get<{
        success: boolean;
        data: { notes: Note[]; pagination: Pagination };
      }>(`/admin/notes?${searchParams.toString()}`);
      return data.data;
    },
  });
}

export function useInspectAdminNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ noteId, reason }: { noteId: string; reason: string }) => {
      const { data } = await api.get<{ success: boolean; data: { note: Note } }>(
        `/admin/notes/${noteId}?reason=${encodeURIComponent(reason)}`
      );
      return data.data.note;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
  });
}

export function useDeleteAdminNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      const { data } = await api.delete(`/admin/notes/${noteId}`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'notes'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

/**
 * 4. Categories & Tags Management
 */
export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: { categories: Category[] } }>(
        '/admin/categories'
      );
      return data.data.categories;
    },
  });
}

export function useDeleteAdminCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/categories/${id}`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useAdminTags() {
  return useQuery({
    queryKey: ['admin', 'tags'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: { tags: Tag[] } }>('/admin/tags');
      return data.data.tags;
    },
  });
}

export function useDeleteAdminTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/tags/${id}`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
    },
  });
}

/**
 * 5. Audit Logs
 */
export function useAdminAuditLogs(params: {
  search?: string;
  action?: string;
  targetType?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.action) searchParams.set('action', params.action);
      if (params.targetType) searchParams.set('targetType', params.targetType);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));

      const { data } = await api.get<{
        success: boolean;
        data: { logs: AdminAuditLog[]; pagination: Pagination };
      }>(`/admin/audit-logs?${searchParams.toString()}`);
      return data.data;
    },
  });
}

/**
 * 6. System Settings & Health
 */
export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        data: { settings: AdminSystemSettings; systemInfo: AdminSystemInfo };
      }>('/admin/settings');
      return data.data;
    },
  });
}

export function useUpdateAdminSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AdminSystemSettings>) => {
      const { data } = await api.patch<{ success: boolean; data: { settings: AdminSystemSettings } }>(
        '/admin/settings',
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}
