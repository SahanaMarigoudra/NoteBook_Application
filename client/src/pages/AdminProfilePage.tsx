import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCheck, Lock, Shield, Mail, Calendar, LogOut, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AdminProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleProfileSubmit = async (data: ProfileFormData) => {
    try {
      setProfileSaving(true);
      const res = await api.patch('/users/me', data);
      updateUser(res.data.data.user);
      toast.success('Admin profile name updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    try {
      setPasswordSaving(true);
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Administrator password changed. Please log in again.');
      await logout();
      navigate('/admin/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Administrator Account Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your verified administrator credentials and security settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card (Left) */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-2xl font-bold text-white shadow-lg shadow-indigo-500/20 mb-3">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <CardTitle className="text-lg">{user?.name}</CardTitle>
            <CardDescription className="text-xs truncate">{user?.email}</CardDescription>
            <div className="pt-2">
              <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 gap-1 text-xs">
                <Shield className="h-3.5 w-3.5" />
                Verified Administrator
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs border-t">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>Created {user?.createdAt ? format(new Date(user.createdAt), 'PPP') : '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        {/* Edit Details & Password (Right) */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">General Information</CardTitle>
                <CardDescription>Update your display name across administrative audit logs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="adminName" className="text-xs font-medium">Administrator Name</Label>
                  <Input id="adminName" {...profileForm.register('name')} />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email Address</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted cursor-not-allowed opacity-70" />
                  <p className="text-[11px] text-muted-foreground">
                    Email address cannot be changed directly from here to protect root authorization.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-3 flex justify-end">
                <Button type="submit" disabled={profileSaving} className="gap-2">
                  {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Profile
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* Change Password Form */}
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Security & Password
                </CardTitle>
                <CardDescription>Change your administrator password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Current Password</Label>
                  <Input type="password" {...passwordForm.register('currentPassword')} />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">New Password</Label>
                  <Input type="password" {...passwordForm.register('newPassword')} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Confirm New Password</Label>
                  <Input type="password" {...passwordForm.register('confirmPassword')} />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-3 flex justify-end">
                <Button type="submit" disabled={passwordSaving} className="gap-2">
                  {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Update Password
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
