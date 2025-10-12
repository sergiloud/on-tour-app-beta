import React, { useEffect, useRef, useState } from 'react';

interface MapPreviewProps {
  className?: string;
  animated?: boolean;
  selectedMarker?: string | null;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  className = '',
  animated = true,
  selectedMarker = null
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    }, 50);

    return () => clearInterval(interval);
  }, [animated]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw simplified European map outline
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(50, 40, 15, 10, 0, 0, Math.PI * 2); // UK
    ctx.ellipse(80, 45, 25, 15, 0, 0, Math.PI * 2); // France
    ctx.ellipse(110, 50, 20, 12, 0, 0, Math.PI * 2); // Germany
    ctx.ellipse(140, 45, 15, 10, 0, 0, Math.PI * 2); // Poland
    ctx.stroke();

    // Draw tour route
    const cities = [
      { x: 80, y: 45, name: 'Paris' },
      { x: 110, y: 50, name: 'Berlin' },
      { x: 140, y: 45, name: 'Warsaw' },
      { x: 110, y: 70, name: 'Vienna' }
    ];

    // Draw route line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const progress = animated ? animationProgress : 1;
    const segments = cities.length - 1;
    const currentSegment = Math.floor(progress * segments);
    const segmentProgress = (progress * segments) % 1;

    for (let i = 0; i <= Math.min(currentSegment + (segmentProgress > 0 ? 1 : 0), segments); i++) {
      const city = cities[i]!;
      if (i === 0) {
        ctx.moveTo(city.x, city.y);
      } else {
        const prevCity = cities[i - 1]!;
        const x = prevCity.x + (city.x - prevCity.x) * (i <= currentSegment ? 1 : segmentProgress);
        const y = prevCity.y + (city.y - prevCity.y) * (i <= currentSegment ? 1 : segmentProgress);
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw city markers
    cities.forEach((city, index) => {
      const isActive = animated ? index <= currentSegment : true;
      const isSelected = selectedMarker && city.name.toLowerCase().includes(selectedMarker.toLowerCase());

      // Selected marker gets special highlighting
      if (isSelected) {
        ctx.fillStyle = '#f59e0b'; // Amber for selected
        ctx.beginPath();
        ctx.arc(city.x, city.y, 5, 0, Math.PI * 2); // Larger radius
        ctx.fill();

        // Add pulsing ring effect
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(city.x, city.y, 8, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = isActive ? '#10b981' : '#6b7280';
        ctx.beginPath();
        ctx.arc(city.x, city.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw show indicator for active cities
      if (isActive) {
        ctx.fillStyle = isSelected ? '#f59e0b' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(city.x, city.y - 8, isSelected ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [animationProgress, animated, selectedMarker]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={180}
        height={100}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="absolute bottom-1 left-1 text-xs text-accent-400">
        {animated ? `${Math.round(animationProgress * 100)}%` : 'Route complete'}
      </div>
    </div>
  );
};