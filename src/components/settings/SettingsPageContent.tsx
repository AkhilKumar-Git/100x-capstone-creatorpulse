'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  User,
  Shield,
  CreditCard,
  Bell,
  Zap,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { ProfileSection } from './ProfileSection';
import { AccountSecuritySection } from './AccountSecuritySection';
import { BillingSection } from './BillingSection';
import { NotificationsSection } from './NotificationsSection';
import { IntegrationsSection } from './IntegrationsSection';
import { DangerZoneSection } from './DangerZoneSection';

interface SettingsNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const settingsNavItems: SettingsNavItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: <User className="h-5 w-5" />,
    description: 'Manage your personal information and avatar'
  },
  {
    id: 'account',
    label: 'Account & Security',
    icon: <Shield className="h-5 w-5" />,
    description: 'Password, 2FA, and security settings'
  },
  {
    id: 'billing',
    label: 'Billing & Subscription',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Manage your plan and payment methods'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="h-5 w-5" />,
    description: 'Control how we communicate with you'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <Zap className="h-5 w-5" />,
    description: 'Connect external platforms and services'
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    icon: <AlertTriangle className="h-5 w-5" />,
    description: 'Irreversible account actions'
  }
];

function SettingsContent({ activeSection }: { activeSection: string }) {
  switch (activeSection) {
    case 'profile':
      return <ProfileSection />;
    case 'account':
      return <AccountSecuritySection />;
    case 'billing':
      return <BillingSection />;
    case 'notifications':
      return <NotificationsSection />;
    case 'integrations':
      return <IntegrationsSection />;
    case 'danger':
      return <DangerZoneSection />;
    default:
      return <ProfileSection />;
  }
}

export function SettingsPageContent() {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-8 w-8 text-purple-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Navigation */}
        <div className="w-80 flex-shrink-0">
          <nav className="space-y-2">
            {settingsNavItems.map((item) => (
              <Button
                key={item.id}
                
                className={cn(
                  "w-full justify-start h-auto p-4 text-left space-y-1",
                  activeSection === item.id
                    ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    : "text-gray-400 hover:text-white hover:bg-neutral-800/50"
                )}
                onClick={() => setActiveSection(item.id)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className={cn(
                    "mt-0.5",
                    activeSection === item.id ? "text-purple-400" : "text-gray-500"
                  )}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-medium text-sm",
                      activeSection === item.id ? "text-purple-300" : "text-gray-300"
                    )}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SettingsContent activeSection={activeSection} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
