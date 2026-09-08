"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimation(
  callback: (progress: number) => void,
  options?: {
    trigger?: string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
  }
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to({}, {
        scrollTrigger: {
          trigger: ref.current,
          start: options?.start || "top bottom",
          end: options?.end || "bottom top",
          scrub: options?.scrub ?? true,
          onUpdate: (self) => callback(self.progress),
        },
      });
    });

    return () => ctx.revert();
  }, [callback, options?.start, options?.end, options?.scrub]);

  return ref;
}

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            end: "top 40%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return ref;
}
