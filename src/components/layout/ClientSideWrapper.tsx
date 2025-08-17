"use client";

import { useEffect, useState } from "react";

interface ClientSideWrapperProps {
  children: React.ReactNode;
}

export default function ClientSideWrapper({ children }: ClientSideWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen">
        {/* Fallback skeleton while mounting */}
        <div className="h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[60px] flex-shrink-0">
          <div className="h-5 w-6 bg-neutral-300 dark:bg-neutral-600 rounded animate-pulse" />
        </div>
        <div className="flex flex-1">
          <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}