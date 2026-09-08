"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/ui/MagneticButton";
import { useImageSequence } from "@/hooks/useImageSequence";

gsap.registerPlugin(ScrollTrigger);

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    const count = window.innerWidth < 640 ? 30 : 60;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 107, 0, ${p.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10"
    />
  );
}

function Spotlight() {
  const mouseRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    let animationId: number;

    const animate = () => {
      posRef.current.x += (mouseRef.current.x - posRef.current.x) * 0.08;
      posRef.current.y += (mouseRef.current.y - posRef.current.y) * 0.08;

      const spotlight = document.getElementById("hero-spotlight");
      if (spotlight) {
        spotlight.style.background = `radial-gradient(600px circle at ${posRef.current.x}px ${posRef.current.y}px, rgba(255, 107, 0, 0.06), transparent 60%)`;
      }

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      id="hero-spotlight"
      className="pointer-events-none absolute inset-0 z-20"
    />
  );
}

export default function Hero() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentFrame, imagesLoaded, setFrame, images } = useImageSequence();
  const [isReady, setIsReady] = useState(false);

  const headingChars = "DEFINE YOUR ESSENCE".split("");

  useEffect(() => {
    if (!wrapperRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: "bottom top",
        pin: sectionRef.current,
        scrub: true,
        onUpdate: (self) => {
          setFrame(self.progress);
        },
      });
    });

    return () => ctx.revert();
  }, [setFrame]);

  useEffect(() => {
    if (imagesLoaded && !isReady) {
      setIsReady(true);
    }
  }, [imagesLoaded, isReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isReady) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = () => {
      const img = images[currentFrame];
      if (!img || !img.complete) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;

      let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    drawFrame();
  }, [currentFrame, isReady, images]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !isReady) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = images[currentFrame];
      if (!img || !img.complete) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;

      let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentFrame, isReady, images]);

  return (
    <div ref={wrapperRef} className="preserve-white h-[300vh] bg-black">
      <section
        ref={sectionRef}
        className="preserve-white relative h-screen w-full overflow-hidden bg-black"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255, 107, 0,0.05)_0%,_transparent_70%)]" />
        </div>

        {/* Background Image - Frame Sequence */}
        <div className="absolute inset-0 z-0">
          <canvas
            ref={canvasRef}
            className="h-full w-full object-cover opacity-40"
          />
          {!isReady && (
            <div
              className="h-full w-full bg-cover bg-center opacity-25"
              style={{ backgroundImage: "url('/hero_banner.png')" }}
            />
          )}
        </div>

        {/* Particles */}
        <Particles />

        {/* Spotlight */}
        <Spotlight />

        {/* Content */}
        <div className="relative z-30 flex h-full flex-col items-center justify-center px-4 sm:px-6">
          {/* Top line */}
          <motion.div
            className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="h-px w-6 bg-[#ff6b00] sm:w-12" />
            <span className="text-[9px] font-medium tracking-[0.3em] text-[#ff6b00] uppercase sm:text-[11px] sm:tracking-[0.4em]">
              SS 2026 Collection
            </span>
            <div className="h-px w-6 bg-[#ff6b00] sm:w-12" />
          </motion.div>

          {/* Main Heading */}
          <div className="mb-6 text-center sm:mb-8">
            <div className="overflow-hidden">
              <motion.h1
                className="text-[clamp(2rem,5.5vw,4.5rem)] font-light leading-[1.1] tracking-[0.06em] text-white"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.2,
                  delay: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span className="block">
                  {headingChars.map((char, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.7 + i * 0.03,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>
            </div>
            <div className="overflow-hidden mt-1 sm:mt-2">
              <motion.h1
                className="text-[clamp(2rem,5.5vw,4.5rem)] font-light leading-[1.1] tracking-[0.08em] text-[#ff6b00]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.2,
                  delay: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                SILENT LUXURY
              </motion.h1>
            </div>
          </div>

          {/* Subtitle */}
          <motion.p
            className="mb-8 max-w-sm text-center text-[13px] font-normal leading-relaxed tracking-wide text-white/55 sm:mb-12 sm:max-w-lg sm:text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Curated essentials for the modern individual. Timeless design meets
            uncompromising quality.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <MagneticButton variant="primary" onClick={() => router.push("/shop")}>
              Explore Collection
            </MagneticButton>
            <MagneticButton variant="secondary" onClick={() => document.getElementById("featured-collection")?.scrollIntoView({ behavior: "smooth" })}>
              Watch Film
            </MagneticButton>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 flex flex-col items-center gap-3 -translate-x-1/2 sm:bottom-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <span className="text-[9px] font-medium tracking-[0.3em] text-white/30 uppercase sm:text-[10px]">
              Scroll
            </span>
            <motion.div
              className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent sm:h-10"
              animate={{ scaleY: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
