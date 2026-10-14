export interface User {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended';
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  userId: any;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  noteCount?: number;
}

export interface Tag {
  _id: string;
  userId: any;
  name: string;
  createdAt: string;
  noteCount?: number;
}

export interface Note {
  _id: string;
  userId: any;
  title: string;
  content: string;
  categoryId: Category | null;
  tags: Tag[];
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface NotesResponse {
  notes: Note[];
  pagination: Pagination;
}

export interface DashboardStats {
  totalActive: number;
  totalArchived: number;
  totalTrashed: number;
  totalPinned: number;
  totalFavorite: number;
  createdThisWeek: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  recentlyUpdated: Note[];
  recentlyCreated: Note[];
  byCategory: Array<{ name: string; color: string; count: number }>;
}

export interface ActivityChartPoint {
  date: string;
  note_created: number;
  note_updated: number;
  note_archived: number;
  note_deleted: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export type NoteLayout = 'grid' | 'list';
export type Theme = 'light' | 'dark' | 'system';

// Admin Types
export interface AdminUser extends User {
  noteCount?: number;
}

export interface AdminDashboardCards {
  totalUsers: number;
  activeUsers: number;
  totalNotes: number;
  notesToday: number;
  notesInTrash: number;
  totalCategories: number;
  newRegistrations: number;
  recentAlertsCount: number;
  maintenanceMode: boolean;
}

export interface AdminDashboardCharts {
  userRegistrations: Array<{ date: string; count: number }>;
  notesCreated: Array<{ date: string; count: number }>;
  categoryDistribution: Array<{ name: string; color: string; count: number }>;
  accountStatusBreakdown: Array<{ name: string; count: number; color: string }>;
}

export interface AdminAuditLog {
  _id: string;
  actorId?: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  status: 'success' | 'failure';
  reason?: string;
  createdAt: string;
}

export interface AdminDashboardData {
  cards: AdminDashboardCards;
  charts: AdminDashboardCharts;
  recentActivity: AdminAuditLog[];
}

export interface AdminSystemSettings {
  _id?: string;
  appName: string;
  allowRegistration: boolean;
  sessionTimeoutMinutes: number;
  maintenanceMode: boolean;
  maxNotesPerUser: number;
  passwordMinLength: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSystemInfo {
  nodeVersion: string;
  platform: string;
  uptimeSeconds: number;
  memoryUsageMB: number;
  database: string;
  totalUsers: number;
  totalNotes: number;
}

