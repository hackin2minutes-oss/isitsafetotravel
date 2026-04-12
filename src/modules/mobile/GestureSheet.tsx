'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface GestureSheetProps {
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
}

export function GestureSheet({ children, snapPoints = [80, 50, 20], initialSnap = 0 }: GestureSheetProps) {
  // snapPoints are percentages of screen-height from the top (e.g., 20 = full screen up, 80 = only seeing header).
  // This calculates Top offset in percentage.
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnap);
  const containerRef = useRef<HTMLDivElement>(null);

  const topOffset = snapPoints[currentSnapIndex];

  // A very basic approximation of gesture dragging
  const handleDrag = () => {
    // Ideally we track touchstart/touchmove/touchend here, 
    // for simplicity we cycle the snaps on tap of the drag handle
    setCurrentSnapIndex((prev) => (prev + 1) % snapPoints.length);
  };

  return (
    <div 
      className="fixed left-0 right-0 bottom-0 z-[500] bg-[#090A0D]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ top: `${topOffset}%` }}
    >
      <div 
        className="w-full flex justify-center p-3 cursor-grab active:cursor-grabbing touch-none"
        onClick={handleDrag}
      >
        <div className="w-12 h-1.5 rounded-full bg-white/20 transition-colors hover:bg-white/40" />
      </div>
      
      <div className="h-full overflow-y-auto pb-32 px-4 subtle-scroll scrollbar-hide">
        {children}
      </div>
    </div>
  );
}
