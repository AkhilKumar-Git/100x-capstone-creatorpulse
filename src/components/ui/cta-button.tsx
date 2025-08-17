'use client';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CTAButtonProps {
  text?: string;
  href?: string;
  onClick?: () => void;
}

export function CTAButton({ 
  text = "Get Started", 
  href = "/signup",
  onClick 
}: CTAButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="group relative flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-blue-500/40 bg-transparent px-10 py-4 text-base font-semibold text-white cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-[16px] active:scale-[0.95] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
    >
      {/* Left arrow (arr-2) */}
      <ArrowRight 
        className="absolute w-5 h-5 left-[-25%] stroke-blue-400 fill-none z-[9] group-hover:left-5 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-4 group-hover:translate-x-4 transition-all duration-[800ms] ease-out text-white">
        {text}
      </span>

      {/* Circle */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-[50%] opacity-0 group-hover:w-[280px] group-hover:h-[280px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"></span>

      {/* Right arrow (arr-1) */}
      <ArrowRight 
        className="absolute w-5 h-5 right-5 stroke-blue-400 fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />

      {/* Magic UI Glow Effect */}
      <div className="absolute inset-0 rounded-[100px] group-hover:rounded-[16px] bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-all duration-[600ms] blur-xl"></div>
    </button>
  );
}