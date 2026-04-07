// components/ui/feature-card-1.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedFeatureCardProps {
  index: string;
  tag: string;
  title: React.ReactNode;
  imageSrc: string;
  color: "green" | "blue" | "dark";
  className?: string;
}

const colorVariants = {
  green: {
    "--feature-color": "hsl(158, 69%, 40%)",
    "--feature-color-light": "hsl(158, 60%, 88%)",
    "--feature-color-dark": "hsl(158, 60%, 97%)",
  },
  blue: {
    "--feature-color": "hsl(211, 100%, 44%)",
    "--feature-color-light": "hsl(211, 100%, 87%)",
    "--feature-color-dark": "hsl(211, 100%, 97%)",
  },
  dark: {
    "--feature-color": "hsl(0, 0%, 18%)",
    "--feature-color-light": "hsl(0, 0%, 82%)",
    "--feature-color-dark": "hsl(0, 0%, 97%)",
  },
};

const AnimatedFeatureCard = React.forwardRef<HTMLDivElement, AnimatedFeatureCardProps>(
  ({ className, index, tag, title, imageSrc, color }, ref) => {
    const cardStyle = colorVariants[color] as React.CSSProperties;

    return (
      <motion.div
        ref={ref}
        style={cardStyle}
        className={cn(
          "relative flex h-[400px] w-full max-w-sm flex-col justify-end overflow-hidden rounded-3xl border border-[#d2d2d7] bg-white p-6 shadow-sm",
          className
        )}
        whileHover="hover"
        initial="initial"
        variants={{
          initial: { y: 0 },
          hover: { y: -8 },
        }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 z-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 25%, var(--feature-color-light) 0%, transparent 65%)`,
          }}
        />

        {/* Index */}
        <div className="absolute top-6 left-6 font-mono text-sm font-semibold text-[#86868b]">
          {index}
        </div>

        {/* Image */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center"
          variants={{
            initial: { scale: 1, y: 0 },
            hover: { scale: 1.08, y: -14 },
          }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={tag}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Content */}
        <div className="relative z-20 rounded-2xl border border-[#d2d2d7] bg-white/90 p-4 backdrop-blur-sm">
          <span
            className="mb-2 inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest uppercase"
            style={{
              backgroundColor: "var(--feature-color-dark)",
              color: "var(--feature-color)",
            }}
          >
            {tag}
          </span>
          <p className="text-sm font-medium text-[#1d1d1f] leading-snug">{title}</p>
        </div>
      </motion.div>
    );
  }
);
AnimatedFeatureCard.displayName = "AnimatedFeatureCard";

export { AnimatedFeatureCard };
