"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rnd } from "react-rnd";

interface DesktopWindow {
  id: string;
  title: string;
  icon: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

const defaultWindows: DesktopWindow[] = [
  {
    id: "about",
    title: "about.txt",
    icon: "📄",
    content: "Hi! I'm ZYR, a frontend engineer. Welcome to my pixel desktop!",
    x: 60,
    y: 60,
    width: 320,
    height: 220,
    zIndex: 1,
  },
  {
    id: "skills",
    title: "skills.txt",
    icon: "🛠️",
    content: "React • TypeScript • Astro • Tailwind CSS • Node.js",
    x: 420,
    y: 100,
    width: 320,
    height: 180,
    zIndex: 2,
  },
  {
    id: "contact",
    title: "contact.txt",
    icon: "📧",
    content: "GitHub: github.com/zyr\nEmail: hello@zyr.me",
    x: 180,
    y: 320,
    width: 320,
    height: 180,
    zIndex: 3,
  },
];

export default function PixelDesktop() {
  const [windows, setWindows] = useState<DesktopWindow[]>(defaultWindows);
  const [openWindowIds, setOpenWindowIds] = useState<string[]>(["about", "skills", "contact"]);
  const highestZIndex = useRef(3);

  const openWindow = (win: DesktopWindow) => {
    if (!openWindowIds.includes(win.id)) {
      setOpenWindowIds((prev) => [...prev, win.id]);
    }
    bringToFront(win.id);
  };

  const closeWindow = (id: string) => {
    setOpenWindowIds((prev) => prev.filter((wid) => wid !== id));
  };

  const bringToFront = (id: string) => {
    highestZIndex.current += 1;
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: highestZIndex.current } : w))
    );
  };

  return (
    <div className="relative w-full h-125 bg-(--color-surface) pixel-border overflow-hidden">
      {/* Desktop area */}
      <div className="absolute inset-0 p-4">
        {/* Desktop icons */}
        <div className="flex flex-col gap-2">
          {defaultWindows.map((win) => (
            <button
              key={win.id}
              onClick={() => openWindow(win)}
              className="flex flex-col items-center gap-1 p-2 hover:bg-(--color-bg-secondary) transition-colors w-20 cursor-pointer"
            >
              <span className="text-2xl">{win.icon}</span>
              <span className="font-['Pixelify_Sans'] text-[10px] text-(--color-text) text-center leading-tight">
                {win.title}
              </span>
            </button>
          ))}
        </div>

        {/* Windows */}
        <AnimatePresence>
          {openWindowIds.map((id) => {
            const win = windows.find((w) => w.id === id);
            if (!win) return null;
            return (
              <Rnd
                key={win.id}
                default={{
                  x: win.x,
                  y: win.y,
                  width: win.width,
                  height: win.height,
                }}
                minWidth={200}
                minHeight={120}
                bounds="parent"
                dragHandleClassName="window-handle"
                style={{ zIndex: win.zIndex }}
                onMouseDown={() => bringToFront(win.id)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full h-full bg-(--color-panel) border-2 border-(--color-border) overflow-hidden flex flex-col"
                  style={{ imageRendering: "pixelated" as const }}
                >
                  {/* Title bar */}
                  <div className="window-handle flex items-center justify-between px-3 py-2 bg-(--color-surface) border-b-2 border-(--color-border) cursor-grab active:cursor-grabbing select-none">
                    <span className="font-['Pixelify_Sans'] text-xs text-(--color-text)">
                      {win.icon} {win.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeWindow(win.id);
                      }}
                      className="w-5 h-5 flex items-center justify-center border border-(--color-border) hover:bg-(--color-accent) hover:text-(--color-text) text-xs transition-colors leading-none pb-0.5 cursor-pointer bg-(--color-bg)"
                    >
                      ×
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 font-['Pixelify_Sans'] text-sm text-(--color-text-secondary) whitespace-pre-wrap overflow-auto">
                    {win.content}
                  </div>
                </motion.div>
              </Rnd>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
