"use client";

import { motion } from "framer-motion";

interface PixelAvatarProps {
  size?: number;
  className?: string;
}

export default function PixelAvatar({ size = 200, className = "" }: PixelAvatarProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div
        className="bg-(--color-surface)"
        style={{
          width: size,
          height: size,
          border: "3px solid var(--color-border)",
          position: "relative",
          imageRendering: "pixelated",
        }}
      >
        {/* Inner border (SNES window style) */}
        <div
          style={{
            position: "absolute",
            inset: "2px",
            border: "1px solid rgba(255,255,255,0.3)",
            pointerEvents: "none",
          }}
        />
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-(--color-text-secondary) font-['Press_Start_2P'] text-[10px] text-center p-4 leading-relaxed">
            PIXEL<br />AVATAR
          </span>
        </div>
      </div>
    </motion.div>
  );
}
