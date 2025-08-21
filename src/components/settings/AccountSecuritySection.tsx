'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Key, Smartphone, Monitor, MapPin, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function AccountSecuritySection() {
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const activeSessions: ActiveSession[] = [
    {
      id: '1',
      device: 'MacBook Pro - Chrome',
      location: 'San Francisco, CA',
      lastActive: 'Current session',
      current: true
    },
    {
      id: '2',
      device: 'iPhone 15 - Safari',
      location: 'San Francisco, CA',
      lastActive: '2 hours ago',
      current: false
    },
    {
      id: '3',
      device: 'Windows PC - Edge',
      location: 'New York, NY',
      lastActive: '1 day ago',
      current: false
    }
  ];

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Session revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('All other sessions revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke sessions');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Account & Security</h2>
        <p className="text-gray-400">Manage your account access and security settings</p>
      </div>

      {/* Password Management */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-purple-400" />
            Password Management
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="bg-neutral-800/50 border-neutral-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="bg-neutral-800/50 border-neutral-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="bg-neutral-800/50 border-neutral-700 text-white"
              />
            </div>
            
            <GradientButton 
              onClick={handlePasswordChange}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </GradientButton>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-purple-400" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Authenticator App</p>
              <p className="text-sm text-gray-400">
                {twoFactorEnabled 
                  ? 'Two-factor authentication is enabled' 
                  : 'Use an authenticator app to generate verification codes'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={twoFactorEnabled ? 'default' : 'secondary'} className={
                twoFactorEnabled 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-neutral-700 text-gray-400'
              }>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleToggle2FA}
                disabled={isLoading}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
          
          {twoFactorEnabled && (
            <div className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-800">
              <p className="text-sm text-gray-400 mb-3">
                Your two-factor authentication is active. If you lose access to your authenticator app, 
                use your backup codes to regain access.
              </p>
              <GradientButton   className="border-neutral-700 text-gray-300">
                View Backup Codes
              </GradientButton>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Monitor className="h-5 w-5 text-purple-400" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage devices that are currently logged into your account</CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <GradientButton   className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  Revoke All Others
                </GradientButton>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#1E1E1E] border-neutral-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Revoke All Sessions?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This will log out all other devices except this one. You'll need to log back in on those devices.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-neutral-800 text-white border-neutral-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleRevokeAllSessions}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Revoke All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-neutral-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-neutral-700 rounded-lg">
                    <Monitor className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{session.device}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {session.current && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Current
                    </Badge>
                  )}
                  {!session.current && (
                    <GradientButton
                      
                      
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </GradientButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            Security Recommendations
          </CardTitle>
          <CardDescription>Tips to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: 'Use a strong password',
                description: 'Your password should be at least 12 characters long and include a mix of letters, numbers, and symbols.',
                status: 'good'
              },
              {
                title: 'Enable two-factor authentication',
                description: 'Add an extra layer of security to your account with 2FA.',
                status: twoFactorEnabled ? 'good' : 'warning'
              },
              {
                title: 'Keep your email secure',
                description: 'Make sure your email account has strong security settings.',
                status: 'good'
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-neutral-800/20 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  item.status === 'good' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <div>
                  <p className="text-white font-medium">{item.title}</p>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
