'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GradientButton } from '@/components/ui/gradient-button';
import { XIcon } from '@/components/ui/x-icon';
import { Linkedin, Instagram, Youtube, Globe, Slack, Zap, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  accountInfo?: {
    username?: string;
    email?: string;
  };
  status: 'active' | 'error' | 'disconnected';
  lastSync?: string;
}

export function IntegrationsSection() {
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'x',
      name: 'X (Twitter)',
      description: 'Connect your X account to analyze tweets and post content',
      icon: <XIcon className="h-6 w-6 text-white" />,
      connected: true,
      accountInfo: { username: '@creator_pulse' },
      status: 'active',
      lastSync: '2 hours ago'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Sync with LinkedIn to analyze professional content',
      icon: <Linkedin className="h-6 w-6 text-[#0077B5]" />,
      connected: true,
      accountInfo: { username: 'Creator Name' },
      status: 'error',
      lastSync: '2 days ago'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect Instagram to analyze visual content and captions',
      icon: <Instagram className="h-6 w-6 text-[#E4405F]" />,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Analyze video titles, descriptions, and comments',
      icon: <Youtube className="h-6 w-6 text-[#FF0000]" />,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'buffer',
      name: 'Buffer',
      description: 'Schedule posts directly to Buffer for publishing',
      icon: <Globe className="h-6 w-6 text-blue-400" />,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications and updates in your Slack workspace',
      icon: <Slack className="h-6 w-6 text-green-400" />,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect to 5000+ apps with custom automations',
      icon: <Zap className="h-6 w-6 text-orange-400" />,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'webhooks',
      name: 'Custom Webhooks',
      description: 'Set up custom webhooks for advanced integrations',
      icon: <Settings className="h-6 w-6 text-purple-400" />,
      connected: false,
      status: 'disconnected'
    }
  ]);

  const handleConnect = async (integrationId: string) => {
    setIsLoading(prev => ({ ...prev, [integrationId]: true }));
    
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId
          ? { 
              ...integration, 
              connected: true, 
              status: 'active',
              accountInfo: { username: `@user_${integrationId}` },
              lastSync: 'Just now'
            }
          : integration
      ));
      
      toast.success(`${integrations.find(i => i.id === integrationId)?.name} connected successfully!`);
    } catch (error) {
      toast.error('Failed to connect. Please try again.');
    } finally {
      setIsLoading(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setIsLoading(prev => ({ ...prev, [integrationId]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId
          ? { 
              ...integration, 
              connected: false, 
              status: 'disconnected',
              accountInfo: undefined,
              lastSync: undefined
            }
          : integration
      ));
      
      toast.success(`${integrations.find(i => i.id === integrationId)?.name} disconnected successfully!`);
    } catch (error) {
      toast.error('Failed to disconnect. Please try again.');
    } finally {
      setIsLoading(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const handleReconnect = async (integrationId: string) => {
    setIsLoading(prev => ({ ...prev, [integrationId]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId
          ? { 
              ...integration, 
              status: 'active',
              lastSync: 'Just now'
            }
          : integration
      ));
      
      toast.success(`${integrations.find(i => i.id === integrationId)?.name} reconnected successfully!`);
    } catch (error) {
      toast.error('Failed to reconnect. Please try again.');
    } finally {
      setIsLoading(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge  className="bg-neutral-700 text-gray-400">
            Not Connected
          </Badge>
        );
    }
  };

  const getActionButton = (integration: Integration) => {
    if (isLoading[integration.id]) {
      return (
        <GradientButton disabled  className="bg-neutral-700">
          Loading...
        </GradientButton>
      );
    }

    if (!integration.connected) {
      return (
        <GradientButton 
          onClick={() => handleConnect(integration.id)}
           
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Connect
        </GradientButton>
      );
    }

    if (integration.status === 'error') {
      return (
        <div className="flex gap-2">
          <GradientButton 
            onClick={() => handleReconnect(integration.id)}
             
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Reconnect
          </GradientButton>
          <GradientButton 
            onClick={() => handleDisconnect(integration.id)}
            
             
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Disconnect
          </GradientButton>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <GradientButton 
          
           
          className="border-neutral-700 text-gray-300 hover:bg-neutral-800"
        >
          Manage
        </GradientButton>
        <GradientButton 
          onClick={() => handleDisconnect(integration.id)}
          
           
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          Disconnect
        </GradientButton>
      </div>
    );
  };

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Integrations</h2>
        <p className="text-gray-400">Connect external platforms and services to enhance your workflow</p>
      </div>

      {/* Overview */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Integration Overview</CardTitle>
          <CardDescription>
            You have {connectedCount} of {integrations.length} available integrations connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{connectedCount}</div>
              <div className="text-sm text-gray-400">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{integrations.length - connectedCount}</div>
              <div className="text-sm text-gray-400">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {integrations.filter(i => i.status === 'error').length}
              </div>
              <div className="text-sm text-gray-400">Need Attention</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Platforms */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Social Media Platforms</CardTitle>
          <CardDescription>Connect your social media accounts for content analysis and posting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {integrations.filter(i => ['x', 'linkedin', 'instagram', 'youtube'].includes(i.id)).map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border border-neutral-700 rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-neutral-700 rounded-lg">
                    {integration.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{integration.name}</h3>
                      {getStatusBadge(integration.status)}
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{integration.description}</p>
                    {integration.connected && integration.accountInfo && (
                      <p className="text-xs text-purple-400">
                        {integration.accountInfo.username || integration.accountInfo.email}
                        {integration.lastSync && ` • Last sync: ${integration.lastSync}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  {getActionButton(integration)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Tools */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Productivity Tools</CardTitle>
          <CardDescription>Integrate with tools to streamline your workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {integrations.filter(i => ['buffer', 'slack', 'zapier', 'webhooks'].includes(i.id)).map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border border-neutral-700 rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-neutral-700 rounded-lg">
                    {integration.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{integration.name}</h3>
                      {getStatusBadge(integration.status)}
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{integration.description}</p>
                    {integration.connected && integration.accountInfo && (
                      <p className="text-xs text-purple-400">
                        {integration.accountInfo.username || integration.accountInfo.email}
                        {integration.lastSync && ` • Last sync: ${integration.lastSync}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  {getActionButton(integration)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Help */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Need Help?</CardTitle>
          <CardDescription>Get assistance with setting up integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              Having trouble connecting an integration? Check out our documentation or contact support.
            </p>
            <div className="flex gap-3">
              <GradientButton  className="border-neutral-700 text-gray-300">
                View Documentation
              </GradientButton>
              <GradientButton  className="border-purple-500/30 text-purple-300">
                Contact Support
              </GradientButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
