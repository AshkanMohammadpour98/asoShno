'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

// Global counter for image failures to help detect VPN/Storage blocks
let failureCount = 0;
let lastFailureTime = 0;

export default function SafeImage({ src, alt, fallbackSrc = '/logo/logo.png', ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (hasError) return;

    setHasError(true);
    setImgSrc(fallbackSrc);

    // Logic to report multiple failures
    const now = Date.now();
    if (now - lastFailureTime > 60000) {
      failureCount = 1; // Reset if long time passed
    } else {
      failureCount++;
    }
    lastFailureTime = now;

    // If more than 3 images fail in a short window, trigger a check event
    if (failureCount >= 3) {
      window.dispatchEvent(new CustomEvent('liara-storage-failure'));
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt || 'Product Image'}
      onError={handleError}
    />
  );
}
