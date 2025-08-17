import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  return (
    <Card className={cn("bg-[#1E1E1E] border-neutral-800", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-[#A0A0A0]">{title}</h3>
        <div className="text-[#64748B]">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#F5F5F5] mb-1">{value}</div>
        <p className="text-xs text-[#A0A0A0]">{change}</p>
      </CardContent>
    </Card>
  );
}
