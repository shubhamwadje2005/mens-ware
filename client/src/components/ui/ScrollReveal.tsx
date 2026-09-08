"use client";

import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type AnimationType =
  | "fadeUp"
  | "fadeDown"
  | "fadeLeft"
  | "fadeRight"
  | "scaleUp"
  | "scaleDown"
  | "blur"
  | "rotate"
  | "splitText";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  distance?: number;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  className?: string;
  once?: boolean;
}

const getAnimationProps = (
  type: AnimationType,
  distance: number
): { from: gsap.TweenVars; to: gsap.TweenVars } => {
  switch (type) {
    case "fadeUp":
      return {
        from: { opacity: 0, y: distance },
        to: { opacity: 1, y: 0 },
      };
    case "fadeDown":
      return {
        from: { opacity: 0, y: -distance },
        to: { opacity: 1, y: 0 },
      };
    case "fadeLeft":
      return {
        from: { opacity: 0, x: distance },
        to: { opacity: 1, x: 0 },
      };
    case "fadeRight":
      return {
        from: { opacity: 0, x: -distance },
        to: { opacity: 1, x: 0 },
      };
    case "scaleUp":
      return {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 },
      };
    case "scaleDown":
      return {
        from: { opacity: 0, scale: 1.2 },
        to: { opacity: 1, scale: 1 },
      };
    case "blur":
      return {
        from: { opacity: 0, filter: "blur(10px)" },
        to: { opacity: 1, filter: "blur(0px)" },
      };
    case "rotate":
      return {
        from: { opacity: 0, rotation: -5, y: distance },
        to: { opacity: 1, rotation: 0, y: 0 },
      };
    case "splitText":
      return {
        from: { opacity: 0, y: distance, clipPath: "inset(0 0 100% 0)" },
        to: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" },
      };
    default:
      return {
        from: { opacity: 0, y: distance },
        to: { opacity: 1, y: 0 },
      };
  }
};

export default function ScrollReveal({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 1,
  distance = 60,
  start = "top 85%",
  end = "top 40%",
  scrub = false,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const { from, to } = getAnimationProps(animation, distance);

      gsap.fromTo(ref.current, from, {
        ...to,
        duration,
        delay,
        ease: scrub ? "none" : "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start,
          end,
          scrub: scrub,
          toggleActions: once ? "play none none none" : "play none none reverse",
        },
      });
    });

    return () => ctx.revert();
  }, [animation, delay, duration, distance, start, end, scrub, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

interface StaggerRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  start?: string;
  className?: string;
}

export function StaggerReveal({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 0.8,
  distance = 40,
  stagger = 0.1,
  start = "top 85%",
  className = "",
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const children = ref.current!.children;
      const { from, to } = getAnimationProps(animation, distance);

      gsap.fromTo(children, from, {
        ...to,
        duration,
        delay,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, [animation, delay, duration, distance, stagger, start]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
