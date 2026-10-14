import React from 'react';
import { Menu, Moon, Sun, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/features/settings/ThemeContext';
import { useAuth } from '@/features/auth/AuthContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card/60 backdrop-blur-md px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Admin Console</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            MongoDB Connected
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Activity indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground mr-2">
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          <span>Real-time DB Sync</span>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <span className="hidden sm:block text-xs font-medium text-foreground max-w-[120px] truncate">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}
