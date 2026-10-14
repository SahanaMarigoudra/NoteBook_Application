import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Settings,
  Server,
  Database,
  Shield,
  Activity,
  Cpu,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminSettings, useUpdateAdminSettings } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

const settingsSchema = z.object({
  appName: z.string().min(1).max(100),
  allowRegistration: z.boolean(),
  maintenanceMode: z.boolean(),
  sessionTimeoutMinutes: z.number().int().min(15).max(43200),
  maxNotesPerUser: z.number().int().min(10).max(100000),
  passwordMinLength: z.number().int().min(6).max(32),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const { data, isLoading } = useAdminSettings();
  const updateMutation = useUpdateAdminSettings();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (data?.settings) {
      reset({
        appName: data.settings.appName,
        allowRegistration: data.settings.allowRegistration,
        maintenanceMode: data.settings.maintenanceMode,
        sessionTimeoutMinutes: data.settings.sessionTimeoutMinutes,
        maxNotesPerUser: data.settings.maxNotesPerUser,
        passwordMinLength: data.settings.passwordMinLength,
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: SettingsFormData) => {
    try {
      await updateMutation.mutateAsync(values);
      toast.success('System settings updated and applied across NoteSpace');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update system settings');
    }
  };

  const allowReg = watch('allowRegistration');
  const maintMode = watch('maintenanceMode');

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          System Settings & Platform Health
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure application-level parameters, registration controls, and inspect infrastructure metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Settings Form (Left 2 Columns) */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Application Policies & Controls
                </CardTitle>
                <CardDescription>Configure platform behaviors and user account limits</CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    {/* App Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="appName" className="text-xs font-medium">Application Name</Label>
                      <Input id="appName" {...register('appName')} />
                    </div>

                    {/* Registration Toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-3.5">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Allow New User Registrations</Label>
                        <p className="text-xs text-muted-foreground">
                          When disabled, public sign-ups are paused and new users cannot register accounts
                        </p>
                      </div>
                      <Switch
                        checked={allowReg}
                        onCheckedChange={(val) => setValue('allowRegistration', val, { shouldDirty: true })}
                      />
                    </div>

                    {/* Maintenance Mode Toggle */}
                    <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4" />
                          Maintenance Mode
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Displays a maintenance banner to active users during system upgrades
                        </p>
                      </div>
                      <Switch
                        checked={maintMode}
                        onCheckedChange={(val) => setValue('maintenanceMode', val, { shouldDirty: true })}
                      />
                    </div>

                    {/* Number Inputs Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="sessionTimeout" className="text-xs font-medium">
                          Session Expiry (Minutes)
                        </Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          {...register('sessionTimeoutMinutes', { valueAsNumber: true })}
                        />
                        <p className="text-[11px] text-muted-foreground">Default: 10080 (7 days)</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="maxNotes" className="text-xs font-medium">
                          Max Notes Limit Per User
                        </Label>
                        <Input
                          id="maxNotes"
                          type="number"
                          {...register('maxNotesPerUser', { valueAsNumber: true })}
                        />
                        <p className="text-[11px] text-muted-foreground">Storage quota cap</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="minPassword" className="text-xs font-medium">
                          Min Password Length
                        </Label>
                        <Input
                          id="minPassword"
                          type="number"
                          {...register('passwordMinLength', { valueAsNumber: true })}
                        />
                        <p className="text-[11px] text-muted-foreground">Minimum characters required</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>

              <CardFooter className="border-t bg-muted/20 px-6 py-3 flex justify-end">
                <Button
                  type="submit"
                  disabled={!isDirty || updateMutation.isPending}
                  className="gap-2"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Configuration
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        {/* Live Infrastructure Info (Right Column) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Server & Runtime
              </CardTitle>
              <CardDescription>Live backend execution environment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {isLoading ? (
                <Skeleton className="h-36 w-full" />
              ) : (
                <>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Node.js Version:</span>
                    <span className="font-mono font-medium">{data?.systemInfo.nodeVersion}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Platform / OS:</span>
                    <span className="font-medium truncate max-w-[140px]">{data?.systemInfo.platform}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Server Uptime:</span>
                    <span className="font-mono font-medium">
                      {Math.floor((data?.systemInfo.uptimeSeconds || 0) / 3600)}h{' '}
                      {Math.floor(((data?.systemInfo.uptimeSeconds || 0) % 3600) / 60)}m
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Process Memory:</span>
                    <span className="font-mono font-medium">{data?.systemInfo.memoryUsageMB} MB heap</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Database:</span>
                    <span className="font-medium text-emerald-500 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      MongoDB 8.0
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-500" />
                Data Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Total Users:</span>
                <span className="font-mono font-bold text-sm">{data?.systemInfo.totalUsers}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Total Notes:</span>
                <span className="font-mono font-bold text-sm">{data?.systemInfo.totalNotes}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
