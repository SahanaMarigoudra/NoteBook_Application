import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';

export default function AdminForbiddenPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive mb-6">
        <ShieldAlert className="h-10 w-10" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        403 — Access Denied
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        You are currently signed in as <strong className="text-foreground">{user?.email}</strong> with standard user permissions.
        The NoteSpace Administration Suite requires verified administrator credentials.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Notes
          </Link>
        </Button>

        <Button variant="default" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Switch Administrator Account
        </Button>
      </div>
    </div>
  );
}
