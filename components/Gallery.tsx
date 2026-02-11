"use client";

import { useState } from "react";

const tabs = ["Before Check", "Close-up", "After Treatment", "Scalp View"];

const tabImages: Record<string, { src: string; alt: string }[]> = {
  "Before Check": [
    { src: "/images/gallery-before-1.jpg", alt: "Combing through hair before check" },
    { src: "/images/gallery-before-2.webp", alt: "Mother checking child's hair" },
    { src: "/images/gallery-before-3.jpg", alt: "Using a nit comb" },
    { src: "/images/gallery-before-4.jpg", alt: "Close-up hair before check" },
    { src: "/images/gallery-before-5.jpg", alt: "Wet combing hair check" },
  ],
  "Close-up": [
    { src: "/images/gallery-closeup-1.webp", alt: "Close-up scalp with lice bites" },
    { src: "/images/gallery-closeup-2.webp", alt: "Close-up nits on hair strands" },
    { src: "/images/gallery-closeup-3.jpg", alt: "Close-up lice eggs on hair" },
    { src: "/images/gallery-closeup-4.jpg", alt: "Close-up heavy nit infestation" },
  ],
};

const Gallery = () => {
  const [active, setActive] = useState(tabs[0]);
  const images = tabImages[active];

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Just Picture It
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          See examples of what our photo checker can identify.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                active === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images ? (
            images.map((img, n) => (
              <div
                key={n}
                className="aspect-square rounded-2xl overflow-hidden border border-border group"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))
          ) : (
            [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-square rounded-2xl bg-muted border border-border flex items-center justify-center"
              >
                <span className="text-muted-foreground/40 text-sm">{active} {n}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
