"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AccurateResults from "@/components/AccurateResults";
import AllInOneFeature from "@/components/AllInOneFeature";
import UseCasesGrid from "@/components/UseCasesGrid";
import FeatureHighlight from "@/components/FeatureHighlight";
import Testimonials from "@/components/Testimonials";
import Gallery from "@/components/Gallery";
import PhotoChecker from "@/components/PhotoChecker";
import SecondaryCTA from "@/components/SecondaryCTA";
import BlogPreview from "@/components/BlogPreview";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  const [heroFile, setHeroFile] = useState<File | null>(null);

  const handleHeroFile = useCallback((file: File) => {
    setHeroFile(file);
  }, []);

  const consumeFile = useCallback(() => {
    setHeroFile(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection onFileSelect={handleHeroFile} />
      <AccurateResults />
      <UseCasesGrid />
      <AllInOneFeature />
      <FeatureHighlight />
      <Testimonials />
      <Gallery />
      <PhotoChecker initialFile={heroFile} onFileConsumed={consumeFile} />
      <SecondaryCTA />
      <BlogPreview />
      <Newsletter />
      <Footer />
    </div>
  );
}
