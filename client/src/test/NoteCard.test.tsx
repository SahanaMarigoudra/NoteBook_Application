import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NoteCard } from '../components/notes/NoteCard';
import type { Note } from '../types';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const mockNote: Note = {
  _id: 'note-123',
  userId: 'user-456',
  title: 'Architecture Review Notes',
  content: 'Here are the key takeaways from the scalability sprint.',
  categoryId: {
    _id: 'cat-1',
    userId: 'user-456',
    name: 'Engineering',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  tags: [
    { _id: 'tag-1', userId: 'user-456', name: 'backend', createdAt: new Date().toISOString() },
    { _id: 'tag-2', userId: 'user-456', name: 'architecture', createdAt: new Date().toISOString() },
  ],
  isPinned: true,
  isFavorite: true,
  isArchived: false,
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('NoteCard Component', () => {
  it('renders note title, content, category, and tags properly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NoteCard note={mockNote} />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Architecture Review Notes')).toBeInTheDocument();
    expect(screen.getByText(/key takeaways/i)).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('backend')).toBeInTheDocument();
    expect(screen.getByText('architecture')).toBeInTheDocument();
  });
});
