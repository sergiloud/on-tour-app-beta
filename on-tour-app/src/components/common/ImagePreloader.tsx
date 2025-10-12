import React, { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  children?: React.ReactNode;
}

export const ImagePreloader: React.FC<ImagePreloaderProps> = ({ images, children }) => {
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  return <>{children}</>;
};