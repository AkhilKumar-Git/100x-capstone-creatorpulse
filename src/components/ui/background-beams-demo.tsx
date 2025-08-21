"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { CTAButton } from "@/components/ui/cta-button";

function BackgroundBeamsDemo() {
  return (
    <div className="h-[40rem] w-full rounded-md bg-background relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="relative z-10 text-lg md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground text-center font-sans font-bold">
          Ready to Reclaim Your Time?
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto my-2 text-sm text-center relative z-10">
          Start posting in minutes with AI-powered drafts and trend insights built for creators.
        </p>
        <div className="flex justify-center mt-6 relative z-10">
          <CTAButton 
            text="Get My First Draft"
            href="/signup"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3 relative z-10">
          Join creators already saving 2+ hours daily
        </p>
      </div>
      <BackgroundBeams />
    </div>
  );
}

export { BackgroundBeamsDemo };
