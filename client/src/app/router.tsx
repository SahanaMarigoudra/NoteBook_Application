import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import { AdminRoute, AdminPublicRoute } from './AdminRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';

// Public & User Pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteDetailPage = lazy(() => import('@/pages/NoteDetailPage'));
const NoteEditorPage = lazy(() => import('@/pages/NoteEditorPage'));
const ArchivePage = lazy(() => import('@/pages/ArchivePage'));
const TrashPage = lazy(() => import('@/pages/TrashPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const TagsPage = lazy(() => import('@/pages/TagsPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// Admin Pages
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'));
const AdminForbiddenPage = lazy(() => import('@/pages/AdminForbiddenPage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage'));
const AdminNotesPage = lazy(() => import('@/pages/AdminNotesPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/AdminCategoriesPage'));
const AdminTagsPage = lazy(() => import('@/pages/AdminTagsPage'));
const AdminActivityLogsPage = lazy(() => import('@/pages/AdminActivityLogsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/AdminSettingsPage'));
const AdminProfilePage = lazy(() => import('@/pages/AdminProfilePage'));

const Loading = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public user routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* User protected routes */}
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="notes/new" element={<NoteEditorPage />} />
            <Route path="notes/:id" element={<NoteDetailPage />} />
            <Route path="notes/:id/edit" element={<NoteEditorPage />} />
            <Route path="archive" element={<ArchivePage />} />
            <Route path="trash" element={<TrashPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="tags" element={<TagsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Admin auth routes */}
          <Route path="/admin/login" element={<AdminPublicRoute><AdminLoginPage /></AdminPublicRoute>} />
          <Route path="/admin/forbidden" element={<AdminForbiddenPage />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="notes" element={<AdminNotesPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="tags" element={<AdminTagsPage />} />
            <Route path="activity-logs" element={<AdminActivityLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
