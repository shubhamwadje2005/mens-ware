"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useGetActiveCampaignQuery, Campaign } from "@/redux/api/campaign.api";

function CampaignBanner({ campaign }: { campaign: Campaign }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [1.15, 1]);
  const textY = useTransform(scrollYProgress, [0.2, 0.6], [80, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const subtitle = campaign.subtitle;
  const titleLine1 = campaign.titleLine1;
  const titleLine2 = campaign.titleLine2;
  const description = campaign.description;
  const image = campaign.image;
  const buttonText = campaign.buttonText || "View Campaign";
  const buttonLink = campaign.buttonLink || "/collections";

  return (
    <section ref={ref} className="preserve-white relative h-screen overflow-hidden">
      {/* Background Image */}
      <motion.div className="absolute inset-0 z-0" style={{ scale }}>
        <img
          src={image}
          alt={`${titleLine1} ${titleLine2} Background`}
          className="h-full w-full object-cover object-center"
        />
        {/* Multi-layer overlay for depth */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6"
        style={{ y: textY, opacity }}
      >
        <ScrollReveal animation="fadeDown" distance={30}>
          <p className="mb-4 text-[10px] font-semibold tracking-[0.45em] text-[#ff6b00] uppercase sm:mb-5 sm:text-[11px]">
            {subtitle}
          </p>
        </ScrollReveal>
        <ScrollReveal animation="fadeUp" distance={60} delay={0.1}>
          <h2 className="mb-5 text-5xl font-light tracking-tight text-white sm:mb-7 sm:text-7xl md:text-8xl lg:text-[9rem]">
            {titleLine1}
            {titleLine2 && (
              <>
                <br />
                <span className="italic bg-gradient-to-r from-[#ffa048] via-[#ff6b00] to-[#c2410c] bg-clip-text text-transparent">
                  {titleLine2}
                </span>
              </>
            )}
          </h2>
        </ScrollReveal>
        <ScrollReveal animation="fadeUp" distance={40} delay={0.2}>
          <p className="mb-10 max-w-sm text-[14px] leading-[1.8] tracking-wide text-white/70 sm:mb-12 sm:max-w-lg sm:text-[15px]">
            {description}
          </p>
        </ScrollReveal>
        <ScrollReveal animation="scaleUp" distance={0} delay={0.3}>
          <Link
            href={buttonLink}
            className="btn-pill btn-pill-white inline-flex items-center justify-center"
          >
            {buttonText}
          </Link>
        </ScrollReveal>
      </motion.div>
    </section>
  );
}

export default function CampaignSection() {
  const { data } = useGetActiveCampaignQuery();
  const campaign = data?.campaign;

  if (!campaign) {
    return null;
  }

  return <CampaignBanner campaign={campaign} />;
}
