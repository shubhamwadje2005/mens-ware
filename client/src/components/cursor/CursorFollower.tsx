"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorFollower() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isHoveredRef = useRef(false);
  const isVisibleRef = useRef(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const dotXSpring = useSpring(dotX, { damping: 35, stiffness: 300 });
  const dotYSpring = useSpring(dotY, { damping: 35, stiffness: 300 });

  useEffect(() => {
    // Only enable on desktop devices with a precision pointer
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    let rafId: number | null = null;
    let lastEvent: MouseEvent | null = null;

    const processMove = () => {
      if (!lastEvent) return;
      const e = lastEvent;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      cursorX.set(e.clientX - 20);
      cursorY.set(e.clientY - 20);
      dotX.set(e.clientX - 4);
      dotY.set(e.clientY - 4);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = !!target.closest(
          "a, button, input, select, textarea, [role='button'], .user-dropdown"
        );
        if (isInteractive !== isHoveredRef.current) {
          isHoveredRef.current = isInteractive;
          setIsHovered(isInteractive);
        }
      }
      rafId = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastEvent = e;
      if (!rafId) {
        rafId = requestAnimationFrame(processMove);
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [cursorX, cursorY, dotX, dotY]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block">
      <motion.div
        className="absolute rounded-full border border-[#ff6b00]/40 transition-[width,height,opacity] duration-200"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          width: isHovered ? 48 : 40,
          height: isHovered ? 48 : 40,
          opacity: isHovered ? 0.25 : 0.6,
        }}
      />
      <motion.div
        className="absolute rounded-full bg-[#ff6b00] transition-[opacity,transform] duration-200"
        style={{
          x: dotXSpring,
          y: dotYSpring,
          width: isHovered ? 4 : 8,
          height: isHovered ? 4 : 8,
          opacity: isHovered ? 0.15 : 0.9,
        }}
      />
    </div>
  );
}
