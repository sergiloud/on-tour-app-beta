import React, { useEffect, useRef, useState } from 'react';

interface MiniChartProps {
  className?: string;
  animated?: boolean;
  type?: 'bar' | 'line';
}

export const MiniChart: React.FC<MiniChartProps> = ({
  className = '',
  animated = true,
  type = 'bar'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (!animated) return;

    const startTime = Date.now();
    const duration = 2000; // 2 seconds animation

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(1, elapsed / duration);

      // Enhanced bounce easing with settling effect
      const bounceWithSettle = (t: number): number => {
        if (t < 0.7) {
          // Initial bounce phase
          const n1 = 7.5625;
          const d1 = 2.75;
          let result = 0;

          if (t < 1 / d1) {
            result = n1 * t * t;
          } else if (t < 2 / d1) {
            result = n1 * (t -= 1.5 / d1) * t + 0.75;
          } else if (t < 2.5 / d1) {
            result = n1 * (t -= 2.25 / d1) * t + 0.9375;
          } else {
            result = n1 * (t -= 2.625 / d1) * t + 0.984375;
          }

          // Add slight overshoot for more dynamic feel
          return result * 1.05;
        } else {
          // Settling phase - subtle oscillation
          const settleProgress = (t - 0.7) / 0.3;
          const oscillation = Math.sin(settleProgress * Math.PI * 4) * 0.02;
          return 1 + oscillation * (1 - settleProgress);
        }
      };

      const easedProgress = bounceWithSettle(rawProgress);
      setAnimationProgress(easedProgress);

      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [animated]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const padding = 10;

    // Sample monthly data (simulating income vs expenses)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const income = [45000, 52000, 48000, 61000, 55000, 67000];
    const expenses = [35000, 42000, 38000, 48000, 45000, 52000];

    const maxValue = Math.max(...income, ...expenses);
    const barWidth = (width - padding * 2) / months.length / 2;

    months.forEach((month, index) => {
      const x = padding + index * (barWidth * 2 + 2);

      // Income bar
      const incomeHeight = ((income[index] ?? 0) / maxValue) * (height - padding * 2);
      const animatedIncomeHeight = animated ? incomeHeight * animationProgress : incomeHeight;

      ctx.fillStyle = '#10b981';
      ctx.fillRect(x, height - padding - animatedIncomeHeight, barWidth, animatedIncomeHeight);

      // Expenses bar
      const expenseHeight = ((expenses[index] ?? 0) / maxValue) * (height - padding * 2);
      const animatedExpenseHeight = animated ? expenseHeight * animationProgress : expenseHeight;

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + barWidth + 1, height - padding - animatedExpenseHeight, barWidth, animatedExpenseHeight);
    });

    // Draw legend
    ctx.fillStyle = '#10b981';
    ctx.fillRect(width - 50, 5, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px sans-serif';
    ctx.fillText('Income', width - 38, 12);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(width - 50, 18, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px sans-serif';
    ctx.fillText('Costs', width - 38, 25);

  }, [animationProgress, animated, type]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={160}
        height={80}
        className="w-full h-full"
      />
      <div className="absolute bottom-1 left-1 text-xs text-accent-400">
        {animated ? `${Math.round(animationProgress * 100)}% loaded` : 'Data loaded'}
      </div>
    </div>
  );
};