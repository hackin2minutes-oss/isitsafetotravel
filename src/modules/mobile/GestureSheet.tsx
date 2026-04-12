'use client';

import React, { useState, useRef, useEffect } from 'react';

interface GestureSheetProps {
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
}

export function GestureSheet({ children, snapPoints = [80, 60, 15], initialSnap = 0 }: GestureSheetProps) {
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  const startY = useRef(0);
  const currentY = useRef(0);

  // Sync snap index when viewMode or external controls change it
  useEffect(() => {
    setCurrentSnapIndex(initialSnap);
  }, [initialSnap]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
    currentY.current = clientY;
  };

  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    currentY.current = clientY;
    const delta = ((clientY - startY.current) / window.innerHeight) * 100;
    setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const baseOffset = snapPoints[currentSnapIndex];
    const finalOffset = baseOffset + dragOffset;

    // Find closest snap point
    let closestIndex = 0;
    let minDiff = Infinity;
    
    snapPoints.forEach((snap, idx) => {
      const diff = Math.abs(snap - finalOffset);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    // Add velocity/momentum heuristic:
    // If they dragged fast upwards (negative offset), snap to a higher point (lower index)
    if (dragOffset < -10 && closestIndex >= currentSnapIndex && currentSnapIndex > 0) {
      closestIndex = currentSnapIndex - 1;
    } else if (dragOffset > 10 && closestIndex <= currentSnapIndex && currentSnapIndex < snapPoints.length - 1) {
      closestIndex = currentSnapIndex + 1;
    }

    setCurrentSnapIndex(closestIndex);
    setDragOffset(0);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('mousemove', handleTouchMove);
      window.addEventListener('mouseup', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', handleTouchMove);
      window.removeEventListener('mouseup', handleTouchEnd);
    };
  }, [isDragging, dragOffset, currentSnapIndex]); // eslint-disable-line

  const handleFocus = () => {
    // Aggressively expand the sheet when an input is focused (keyboard pop-up)
    setCurrentSnapIndex(snapPoints.length - 1);
  };

  const currentTop = snapPoints[currentSnapIndex] + (isDragging ? dragOffset : 0);

  // Constrain limits
  const minTop = Math.min(...snapPoints) - 10;
  const maxTop = Math.max(...snapPoints) + 10;
  const boundedTop = Math.min(Math.max(currentTop, minTop), maxTop);

  return (
    <div 
      className={`fixed left-0 right-0 bottom-0 z-[500] bg-[#090A0D]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] ${!isDragging ? 'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''}`}
      style={{ top: \`\${boundedTop}%\` }}
      onFocusCapture={handleFocus}
    >
      <div 
        className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing touch-none relative z-10"
        onTouchStart={handleTouchStart}
        onMouseDown={handleTouchStart}
        onClick={() => {
           if (!isDragging) setCurrentSnapIndex((prev) => (prev + 1) % snapPoints.length);
        }}
      >
        <div className="w-12 h-1.5 rounded-full bg-white/20 transition-colors hover:bg-white/40 pointer-events-none" />
      </div>
      
      <div className="h-[calc(100%-2rem)] overflow-y-auto pb-48 px-4 subtle-scroll scrollbar-hide">
        {children}
      </div>
    </div>
  );
}
