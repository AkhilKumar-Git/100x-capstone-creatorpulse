"use client";

import { cn } from "@/shared/utils/cn";
import { motion } from "framer-motion";
import React from "react";

interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function AnimatedButton({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: AnimatedButtonProps) {
  const baseClasses = cn(
    "relative inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 ease-in-out",
    "overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed",
    "border border-transparent",
    {
      "px-6 py-3 text-sm": size === "sm",
      "px-8 py-4 text-base": size === "md", 
      "px-10 py-5 text-lg": size === "lg",
    },
    {
      "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700": variant === "primary",
      "bg-transparent border-gray-300 text-gray-300 hover:border-white hover:text-white": variant === "secondary",
    },
    className
  );

  return (
    <motion.button
      className={baseClasses}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full"
        initial={{ scale: 0 }}
        whileHover={{ scale: 1.5 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      
      {/* Content */}
      <span className="relative z-10 font-medium">
        {children}
      </span>
    </motion.button>
  );
}