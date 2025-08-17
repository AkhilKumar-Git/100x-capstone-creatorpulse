'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Download, Archive } from 'lucide-react';
import { toast } from 'sonner';

export function DangerZoneSection() {
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [confirmationText, setConfirmationText] = useState('');
  const [accountDeletionText, setAccountDeletionText] = useState('');

  const handleExportData = async () => {
    setIsLoading(prev => ({ ...prev, export: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Data export started. You will receive an email when ready.');
    } finally {
      setIsLoading(prev => ({ ...prev, export: false }));
    }
  };

  const handleClearData = async () => {
    if (confirmationText !== 'CLEAR') {
      toast.error('Please type "CLEAR" to confirm');
      return;
    }

    setIsLoading(prev => ({ ...prev, clear: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('All generated content and analytics data has been cleared.');
      setConfirmationText('');
    } finally {
      setIsLoading(prev => ({ ...prev, clear: false }));
    }
  };

  const handleDeleteAccount = async () => {
    if (accountDeletionText !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsLoading(prev => ({ ...prev, delete: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Account deletion initiated. You will receive a confirmation email.');
      setAccountDeletionText('');
    } finally {
      setIsLoading(prev => ({ ...prev, delete: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Danger Zone</h2>
        <p className="text-gray-400">Irreversible actions that affect your account and data</p>
      </div>

      {/* Warning Notice */}
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-400 font-medium">Warning</h3>
            <p className="text-red-300 text-sm mt-1">
              The actions in this section are permanent and cannot be undone. Please proceed with caution.
            </p>
          </div>
        </div>
      </div>

      {/* Export Data */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-400" />
            Export Your Data
          </CardTitle>
          <CardDescription>Download a copy of all your data before making changes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              This will create a comprehensive export of your account data including posts, analytics, 
              style profiles, and settings. The export will be sent to your email address.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-2">Export will include:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• All generated content and drafts</li>
                <li>• Analytics and performance data</li>
                <li>• Style profiles and AI training data</li>
                <li>• Account settings and preferences</li>
                <li>• Connected sources and integrations</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleExportData}
              disabled={isLoading.export}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading.export ? 'Exporting...' : 'Export My Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clear Generated Content */}
      <Card className="bg-[#1E1E1E] border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Archive className="h-5 w-5 text-orange-400" />
            Clear Generated Content
          </CardTitle>
          <CardDescription>Remove all AI-generated content and analytics data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-orange-300 text-sm">
              This will permanently delete all AI-generated drafts, analytics data, and style profiles. 
              Your account settings and connected sources will remain intact.
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              >
                Clear All Generated Content
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1E1E1E] border-neutral-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  Clear All Generated Content?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This action cannot be undone. All AI-generated content, analytics data, and style profiles will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="clear-confirmation" className="text-white">
                    Type "CLEAR" to confirm:
                  </Label>
                  <Input
                    id="clear-confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-white"
                    placeholder="CLEAR"
                  />
                </div>
              </div>
              
              <AlertDialogFooter>
                <AlertDialogCancel 
                  className="bg-neutral-800 text-white border-neutral-700"
                  onClick={() => setConfirmationText('')}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  disabled={confirmationText !== 'CLEAR' || isLoading.clear}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isLoading.clear ? 'Clearing...' : 'Clear All Content'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="bg-[#1E1E1E] border-red-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-400" />
            Delete Account
          </CardTitle>
          <CardDescription>Permanently delete your CreatorPulse account and all associated data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="space-y-2">
              <p className="text-red-300 text-sm font-medium">
                Account deletion is permanent and cannot be reversed.
              </p>
              <p className="text-red-300 text-sm">
                This will immediately delete your account and all associated data including:
              </p>
              <ul className="text-red-300 text-sm space-y-1 ml-4">
                <li>• Your profile and account information</li>
                <li>• All generated content and drafts</li>
                <li>• Analytics and performance data</li>
                <li>• Style profiles and AI training data</li>
                <li>• Connected sources and integrations</li>
                <li>• Billing information and subscription</li>
              </ul>
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1E1E1E] border-neutral-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-400" />
                  Delete Account Permanently?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This action cannot be undone. Your account and all associated data will be permanently deleted.
                  You will lose access to all your content, analytics, and integrations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-red-300 text-sm">
                    We recommend exporting your data before deletion.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delete-confirmation" className="text-white">
                    Type "DELETE" to confirm account deletion:
                  </Label>
                  <Input
                    id="delete-confirmation"
                    value={accountDeletionText}
                    onChange={(e) => setAccountDeletionText(e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-white"
                    placeholder="DELETE"
                  />
                </div>
              </div>
              
              <AlertDialogFooter>
                <AlertDialogCancel 
                  className="bg-neutral-800 text-white border-neutral-700"
                  onClick={() => setAccountDeletionText('')}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={accountDeletionText !== 'DELETE' || isLoading.delete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading.delete ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
