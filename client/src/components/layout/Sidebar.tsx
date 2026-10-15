import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Archive,
  Trash2,
  Tag,
  FolderOpen,
  Settings,
  LogOut,
  X,
  BookOpen,
  Search,
  Plus,
  GraduationCap,
  BookHeart,
  Lightbulb,
  CheckSquare,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes', icon: FileText, label: 'All Notes' },
  { to: '/search', icon: Search, label: 'Search' },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: categories } = useCategories();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('study') || lower.includes('academic')) return GraduationCap;
    if (lower.includes('journal') || lower.includes('personal')) return BookHeart;
    if (lower.includes('idea') || lower.includes('concept')) return Lightbulb;
    if (lower.includes('task') || lower.includes('todo')) return CheckSquare;
    return FolderOpen;
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Brand Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
            <BookOpen className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base font-bold tracking-tight text-foreground">
              NoteSpace
            </span>
            <span className="text-[10px] tracking-wider uppercase text-muted-foreground -mt-1 font-sans">
              Digital Notebook
            </span>
          </div>
        </Link>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        {/* Administrator Switcher if logged in as Admin */}
        {user?.role === 'admin' && (
          <div className="mb-3">
            <Link
              to="/admin/dashboard"
              onClick={onClose}
              className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all group"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Admin Control Panel</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}

        {/* Main Nav */}
        <nav className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <Separator className="my-4 bg-border/70" />

        {/* Notebooks / Categories */}
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Notebooks
          </p>
          <Link
            to="/categories"
            onClick={onClose}
            className="text-[11px] text-primary hover:underline flex items-center"
            title="Manage all categories"
          >
            Edit
          </Link>
        </div>

        <nav className="space-y-1">
          {categories?.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            return (
              <NavLink
                key={cat._id}
                to={`/notes?categoryId=${cat._id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary/15 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate flex-1">{cat.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <Separator className="my-4 bg-border/70" />

        {/* Organize */}
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Storage & Trash
        </p>
        <nav className="space-y-1">
          <NavLink
            to="/tags"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <Tag className="h-3.5 w-3.5 shrink-0" />
            <span>Tags</span>
          </NavLink>

          <NavLink
            to="/archive"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <Archive className="h-3.5 w-3.5 shrink-0" />
            <span>Archive</span>
          </NavLink>

          <NavLink
            to="/trash"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            <span>Trash</span>
          </NavLink>
        </nav>
      </ScrollArea>

      {/* Footer User Info & Settings */}
      <div className="border-t border-border p-3 space-y-1">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
              isActive
                ? 'bg-primary/15 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )
          }
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>

        {user && (
          <div className="pt-2 px-3 pb-1 border-t border-border/50 text-[11px] text-muted-foreground truncate">
            <span className="font-medium text-foreground block truncate">{user.name}</span>
            <span className="truncate block opacity-80">{user.email}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
