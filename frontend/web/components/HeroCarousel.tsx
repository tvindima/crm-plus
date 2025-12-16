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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % properties.length);
    setShowVideo(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + properties.length) % properties.length);
    setShowVideo(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setShowVideo(false);
  };

  return (
    <section className="relative isolate h-[450px] w-full overflow-hidden md:h-[520px]">{/* Background Image */}
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
      <div className="absolute bottom-4 left-4 right-4 space-y-2 md:bottom-10 md:left-16 md:right-auto md:max-w-xl md:space-y-4">
        {currentProperty?.reference && (
          <span className="inline-block rounded bg-black/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E10600] md:px-3 md:py-1 md:text-xs">
            {currentProperty.reference}
          </span>
        )}
        <h1 className="text-xl font-semibold leading-tight md:text-5xl">
          {currentProperty?.title || "Descobre imóveis que valem o prime time"}
        </h1>
        <p className="text-xs text-[#C5C5C5] md:text-sm">
          {currentProperty
            ? `${currentProperty.typology || currentProperty.property_type || "Propriedade"} • ${price} • ${
                currentProperty.location || currentProperty.municipality || "Localização reservada"
              }`
            : "Seleção semanal com curadoria de especialistas, disponível em catálogo imersivo ao estilo Netflix."}
        </p>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {currentProperty ? (
            <Link
              href={`/imovel/${encodeURIComponent(currentProperty.reference || currentProperty.title || `imovel-${currentProperty.id}`)}`}
              className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black shadow-lg shadow-[#E10600]/40 transition hover:scale-105 md:px-6 md:py-3 md:text-sm"
            >
              Ver detalhes
            </Link>
          ) : (
            <Link
              href="/imoveis"
              className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black shadow-lg shadow-[#E10600]/40 md:px-6 md:py-3 md:text-sm"
            >
              Ver catálogo completo
            </Link>
          )}
          <Link
            href="/imoveis?f=arrendar"
            className="hidden rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white hover:bg-white/10 md:inline-block md:px-6 md:py-3 md:text-sm"
          >
            Imóveis para arrendamento
          </Link>
        </div>
      </div>

      {/* Property Thumbnails - Bottom Right */}
      <div className="absolute bottom-10 right-6 hidden gap-2 md:flex md:right-16">
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

      {/* Navigation Arrows */}
      {properties.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70 md:left-4 md:p-3"
            aria-label="Imóvel anterior"
          >
            <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70 md:right-4 md:p-3"
            aria-label="Próximo imóvel"
          >
            <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Navigation (Mobile) */}
      {properties.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2 md:hidden">
          {properties.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 w-2 rounded-full transition ${
                idx === currentIndex ? "bg-[#E10600] w-6" : "bg-white/50"
              }`}
              aria-label={`Ir para imóvel ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
