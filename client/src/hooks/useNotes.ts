import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Note, NotesResponse } from '@/types';

export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (params: object) => [...noteKeys.lists(), params] as const,
  detail: (id: string) => [...noteKeys.all, 'detail', id] as const,
  trash: () => [...noteKeys.all, 'trash'] as const,
  archive: () => [...noteKeys.lists(), { isArchived: 'true' }] as const,
  dashboard: () => ['dashboard'] as const,
};

export function useNotes(params: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: noteKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get('/notes', { params });
      return data.data as NotesResponse;
    },
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/notes/${id}`);
      return data.data.note as Note;
    },
    enabled: !!id,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: object) => {
      const { data } = await api.post('/notes', body);
      return data.data.note as Note;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.lists() });
      qc.invalidateQueries({ queryKey: noteKeys.dashboard() });
    },
  });
}

export function useUpdateNote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: object) => {
      const { data } = await api.patch(`/notes/${id}`, body);
      return data.data.note as Note;
    },
    onSuccess: (note) => {
      qc.setQueryData(noteKeys.detail(id), note);
      qc.invalidateQueries({ queryKey: noteKeys.lists() });
      qc.invalidateQueries({ queryKey: noteKeys.dashboard() });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notes/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.lists() });
      qc.invalidateQueries({ queryKey: noteKeys.trash() });
      qc.invalidateQueries({ queryKey: noteKeys.dashboard() });
    },
  });
}

export function usePinNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const { data } = await api.patch(`/notes/${id}/pin`, { isPinned });
      return data.data.note as Note;
    },
    onSuccess: (note) => {
      qc.setQueryData(noteKeys.detail(note._id), note);
      qc.invalidateQueries({ queryKey: noteKeys.lists() });
      qc.invalidateQueries({ queryKey: noteKeys.dashboard() });
    },
  });
}

export function useFavoriteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { data } = await api.patch(`/notes/${id}/favorite`, { isFavorite });
      return data.data.note as Note;
    },
    onSuccess: (note) => {
      qc.setQueryData(noteKeys.detail(note._id), note);
      qc.invalidateQueries({ queryKey: noteKeys.lists() });
      qc.invalidateQueries({ queryKey: noteKeys.dashboard() });
    },
  });
}

export function useArchiveNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const { data } = await api.patch(`/notes/${id}/archive`, { isArchived });
      return data.data.note as Note;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.lists() });
      qc.invalidateQueries({ queryKey: noteKeys.archive() });
      qc.invalidateQueries({ queryKey: noteKeys.dashboard() });
    },
  });
}

export function useTrash() {
  return useQuery({
    queryKey: noteKeys.trash(),
    queryFn: async () => {
      const { data } = await api.get('/trash');
      return data.data.notes as Note[];
    },
  });
}

export function useRestoreNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/trash/${id}/restore`);
      return data.data.note as Note;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.trash() });
      qc.invalidateQueries({ queryKey: noteKeys.lists() });
      qc.invalidateQueries({ queryKey: noteKeys.dashboard() });
    },
  });
}

export function usePermanentDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/trash/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.trash() });
      qc.invalidateQueries({ queryKey: noteKeys.dashboard() });
    },
  });
}

export function useEmptyTrash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/trash');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.trash() });
      qc.invalidateQueries({ queryKey: noteKeys.dashboard() });
    },
  });
}
