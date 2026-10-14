export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  _id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface Note {
  _id: string;
  userId: string;
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
