"use client";
import React from "react";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface CustomButtonProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function CustomButton({
  children,
  variant = "default",
  size = "md",
  className,
  onClick,
  disabled = false,
  type = "button",
  ...props
}: CustomButtonProps) {
  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const variantClasses = {
    default: "bg-gray-700/90 hover:bg-gray-600/90 text-white border-gray-500/50",
    outline: "bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 border-gray-500/50",
    ghost: "bg-transparent hover:bg-gray-800/30 text-gray-300 border-transparent",
    destructive: "bg-red-600/90 hover:bg-red-700/90 text-white border-red-500/50",
  };

  return (
    <motion.div
      className={cn(
        "relative inline-block rounded-lg overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {/* Moving border effect - only on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <MovingBorder duration={2000} rx="8px" ry="8px">
          <div className="h-6 w-6 opacity-60 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full blur-sm" />
        </MovingBorder>
      </div>

      {/* Actual button */}
      <motion.button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative rounded-lg border transition-all duration-200 font-medium",
          "disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {/* Silver brightness overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 via-gray-300/5 to-gray-400/10 rounded-lg" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {children}
        </div>
      </motion.button>
    </motion.div>
  );
}

const MovingBorder = ({
  children,
  duration = 2000,
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  [key: string]: any;
}) => {
  const pathRef = useRef<any>();
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).x
  );
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).y
  );

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  );
};
