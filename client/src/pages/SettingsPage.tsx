import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User, Lock, Palette, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/features/settings/ThemeContext';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const profileForm = useForm<{ name: string }>({ resolver: zodResolver(z.object({ name: z.string().min(2).max(100) })), defaultValues: { name: user?.name ?? '' } });
  const passwordForm = useForm<{ currentPassword: string; newPassword: string }>({
    resolver: zodResolver(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    })),
  });
  const deleteForm = useForm<{ password: string }>({ resolver: zodResolver(z.object({ password: z.string().min(1) })) });

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleProfileUpdate = async (data: { name: string }) => {
    try {
      setProfileSaving(true);
      const res = await api.patch('/users/me', data);
      updateUser(res.data.data.user);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      setPasswordSaving(true);
      await api.post('/auth/change-password', data);
      toast.success('Password changed. Please sign in again.');
      await logout();
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async (data: { password: string }) => {
    try {
      await api.delete('/users/me', { data });
      await logout();
      navigate('/');
      toast.success('Account deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to delete account');
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" />Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input {...profileForm.register('name')} className="mt-1.5" />
              {profileForm.formState.errors.name && <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ''} disabled className="mt-1.5 opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <Button type="submit" size="sm" disabled={profileSaving}>
              {profileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><Lock className="h-4 w-4" />Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
            <div>
              <Label>Current password</Label>
              <Input type="password" {...passwordForm.register('currentPassword')} className="mt-1.5" />
            </div>
            <div>
              <Label>New password</Label>
              <Input type="password" {...passwordForm.register('newPassword')} className="mt-1.5" />
              {passwordForm.formState.errors.newPassword && <p className="text-xs text-destructive mt-1">Min 8 chars, uppercase, lowercase, and number required</p>}
            </div>
            <Button type="submit" size="sm" disabled={passwordSaving}>
              {passwordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Change password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4" />Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 rounded-md border py-2 text-sm font-medium capitalize transition-colors ${theme === t ? 'border-primary bg-primary/10 text-primary' : 'hover:border-primary/30'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-destructive"><AlertCircle className="h-4 w-4" />Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-1.5" />Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>All your notes, categories, tags, and data will be permanently deleted. This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <form onSubmit={deleteForm.handleSubmit(handleDeleteAccount)} className="mt-2">
                <Label>Enter your password to confirm</Label>
                <Input type="password" {...deleteForm.register('password')} className="mt-1.5 mb-4" placeholder="Your password" />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button type="submit" variant="destructive">Delete my account forever</Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
