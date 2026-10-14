import React from 'react';
import { Link } from 'react-router-dom';
import { StickyNote, Search, Archive, Tag, Shield, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: StickyNote, title: 'Rich Notes', desc: 'Create, organize, and manage all your notes with categories and tags.' },
  { icon: Search, title: 'Powerful Search', desc: 'Full-text search across all your notes in real time.' },
  { icon: Archive, title: 'Archive & Trash', desc: 'Archive notes you rarely use, trash notes safely with restore.' },
  { icon: Tag, title: 'Tags & Categories', desc: 'Organize with unlimited tags and color-coded categories.' },
  { icon: Shield, title: 'Secure by Design', desc: 'JWT authentication, bcrypt passwords, and HttpOnly cookie sessions.' },
  { icon: Zap, title: 'Auto-save', desc: 'Never lose a thought — autosave keeps your work safe.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            <span className="font-semibold">NoteSpace</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Notes that stay{' '}
          <span className="text-primary">organized</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          NoteSpace is a professional notes management application that keeps your ideas safe, searchable, and organized.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link to="/register">
              Start for free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <h2 className="text-2xl font-semibold text-center mb-10">Everything you need to stay organized</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <StickyNote className="h-4 w-4 text-primary" />
          <span className="font-medium">NoteSpace</span>
        </div>
        <div className="flex justify-center gap-4">
          <Link to="/login" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/login" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/login" className="hover:text-foreground transition-colors">Contact</Link>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} NoteSpace. All rights reserved.</p>
      </footer>
    </div>
  );
}
