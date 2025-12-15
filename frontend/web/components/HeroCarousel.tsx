"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SafeImage } from "./SafeImage";
import type { Property } from "../src/services/publicApi";
import { getPropertyCover, getPlaceholderImage } from "../src/utils/placeholders";

interface HeroCarouselProps {
  properties: Property[];
}

export function HeroCarousel({ properties }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const currentProperty = properties[currentIndex] || properties[0];
  const heroImage = currentProperty ? getPropertyCover(currentProperty) : getPlaceholderImage("hero");

  // Start video after 3 seconds on first property
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const price = currentProperty?.price
    ? currentProperty.price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })
    : "Preço sob consulta";

  return (
    <section className="relative isolate h-[520px] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 h-full w-full bg-center transition-opacity duration-700"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          opacity: showVideo ? 0.3 : 1,
        }}
      />

      {/* Video Placeholder (would be actual video in production) */}
      {showVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/60">
            <svg
              className="mx-auto h-20 w-20 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-sm">Vídeo do imóvel</p>
          </div>
        </div>
      )}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

      {/* Main Content */}
      <div className="absolute bottom-10 left-6 max-w-xl space-y-4 md:left-16">
        <p className="text-sm uppercase tracking-[0.3em] text-[#E10600]">Experiência Cinematográfica</p>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          {currentProperty?.title || "Descobre imóveis que valem o prime time"}
        </h1>
        <p className="text-sm text-[#C5C5C5]">
          {currentProperty
            ? `${currentProperty.typology || currentProperty.property_type || "Propriedade"} • ${price} • ${
                currentProperty.location || currentProperty.municipality || "Localização reservada"
              }`
            : "Seleção semanal com curadoria de especialistas, disponível em catálogo imersivo ao estilo Netflix."}
        </p>
        <div className="flex flex-wrap gap-3">
          {currentProperty ? (
            <Link
              href={`/imovel/${encodeURIComponent(currentProperty.reference || currentProperty.title || `imovel-${currentProperty.id}`)}`}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-[#E10600]/40 transition hover:scale-105"
            >
              Ver detalhes
            </Link>
          ) : (
            <Link
              href="/imoveis"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-[#E10600]/40"
            >
              Ver catálogo completo
            </Link>
          )}
          <Link
            href="/imoveis?f=arrendar"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Imóveis para arrendamento
          </Link>
        </div>
      </div>

      {/* Property Thumbnails - Bottom Right */}
      <div className="absolute bottom-6 right-6 flex gap-2 md:bottom-10 md:right-16">
        {properties.slice(0, 3).map((property, idx) => (
          <button
            key={property.id}
            onClick={() => {
              setCurrentIndex(idx);
              setShowVideo(false);
            }}
            className={`group relative h-16 w-24 overflow-hidden rounded-lg border-2 transition ${
              idx === currentIndex ? "border-[#E10600] scale-110" : "border-white/20 hover:border-white/50"
            }`}
          >
            <SafeImage
              src={getPropertyCover(property)}
              alt={property.title}
              fill
              className="object-cover"
              sizes="100px"
            />
            {idx === currentIndex && (
              <div className="absolute inset-0 bg-[#E10600]/20 ring-2 ring-[#E10600]" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
