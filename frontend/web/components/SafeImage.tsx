"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";
import { getPlaceholderImage } from "../src/utils/placeholders";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = getPlaceholderImage("default");

export function SafeImage({ src, alt, fallbackSrc = DEFAULT_FALLBACK, className, fill, sizes, priority, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(typeof src === 'string' ? src : '');
  const [hasError, setHasError] = useState(false);

  // Reset when src changes
  useEffect(() => {
    const newSrc = typeof src === 'string' ? src : '';
    setImgSrc(newSrc);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Use native img for better error handling and simplicity
  if (fill) {
    return (
      <img
        src={imgSrc}
        alt={alt as string}
        className={className || ''}
        style={{ 
          position: 'absolute', 
          height: '100%', 
          width: '100%', 
          inset: 0, 
          objectFit: 'cover' 
        }}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      unoptimized
    />
  );
}
