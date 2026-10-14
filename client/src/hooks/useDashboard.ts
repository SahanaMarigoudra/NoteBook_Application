import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardSummary, ActivityChartPoint } from '@/types';
import { noteKeys } from './useNotes';

export function useDashboardSummary() {
  return useQuery({
    queryKey: noteKeys.dashboard(),
    queryFn: async () => {
      const { data } = await api.get('/dashboard/summary');
      return data.data as DashboardSummary;
    },
  });
}

export function useActivityChart(days: 7 | 30 = 7) {
  return useQuery({
    queryKey: ['dashboard', 'activity', days],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/activity', { params: { days } });
      return data.data.chart as ActivityChartPoint[];
    },
  });
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: async () => {
      const { data } = await api.get('/search', { params: { q } });
      return data.data.notes;
    },
    enabled: q.trim().length >= 2,
    staleTime: 10000,
  });
}
