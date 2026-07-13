"use client";
import React from 'react';

interface NeshanMapProps {
  latitude: number;
  longitude: number;
  address?: string;
}

const NeshanMap: React.FC<NeshanMapProps> = ({ latitude, longitude, address }) => {
  const neshanIframeUrl = `https://neshan.org/maps/iframe/places/_bW7KuYANZqo#c${latitude}-${longitude}-15z-0p/${latitude}/${longitude}`;

  return (
    <div className="relative w-full h-full min-h-[400px] bg-muted/10 overflow-hidden rounded-[inherit]">
      <iframe
        title="map-iframe"
        src={neshanIframeUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 w-full h-full z-0 grayscale-[0.1] contrast-[1.05]"
      ></iframe>
      {/* Glass gradient overlay to soften edges */}
      <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-transparent to-black/5"></div>
    </div>
  );
};

export default NeshanMap;
