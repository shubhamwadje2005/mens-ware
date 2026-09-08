"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/hero/Hero";

const SmoothScrollProvider = dynamic(
  () => import("@/components/layout/SmoothScrollProvider"),
  { ssr: false }
);

const CursorFollower = dynamic(
  () => import("@/components/cursor/CursorFollower"),
  { ssr: false }
);

const FeaturedCollection = dynamic(
  () => import("@/components/storytelling/FeaturedCollection")
);

const FeaturedProducts = dynamic(
  () => import("@/components/featured/FeaturedProducts")
);

const SplitScreen = dynamic(
  () => import("@/components/storytelling/SplitScreen")
);

const Categories = dynamic(
  () => import("@/components/categories/Categories")
);

const HorizontalGallery = dynamic(
  () => import("@/components/storytelling/HorizontalGallery")
);

const CampaignSection = dynamic(
  () => import("@/components/storytelling/CampaignSection")
);

const Testimonials = dynamic(
  () => import("@/components/testimonials/Testimonials")
);

const Philosophy = dynamic(
  () => import("@/components/philosophy/Philosophy")
);

const InstagramGallery = dynamic(
  () => import("@/components/instagram/InstagramGallery")
);

const Footer = dynamic(() => import("@/components/footer/Footer"));
const ToastContainer = dynamic(() => import("@/components/toast/ToastContainer"));
const SearchModal = dynamic(() => import("@/components/search/SearchModal"));

export default function Home() {
  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main>
        <Hero />
        <FeaturedCollection />
        <FeaturedProducts />
        <SplitScreen />
        <Categories />
        <HorizontalGallery />
        <CampaignSection />
        <Testimonials />
        <Philosophy />
        <InstagramGallery />
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
