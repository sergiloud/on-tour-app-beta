import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonScreenProps {
  variant?: 'list' | 'grid' | 'card' | 'widget';
  count?: number;
  className?: string;
}

/**
 * iOS-style Skeleton Screen for loading states
 * Shows a shimmering placeholder while content loads
 */
export const SkeletonScreen: React.FC<SkeletonScreenProps> = ({
  variant = 'list',
  count = 3,
  className = '',
}) => {
  const shimmer = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
  };

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-sm rounded-[16px] p-4 border border-white/10 relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              {/* Avatar skeleton */}
              <div className="w-12 h-12 rounded-xl bg-white/10 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'linear',
                    delay: i * 0.1,
                  }}
                />
              </div>

              {/* Content skeleton */}
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded-lg w-3/4 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    variants={shimmer}
                    initial="initial"
                    animate="animate"
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: 'linear',
                      delay: i * 0.1,
                    }}
                  />
                </div>
                <div className="h-3 bg-white/10 rounded-lg w-1/2 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    variants={shimmer}
                    initial="initial"
                    animate="animate"
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: 'linear',
                      delay: i * 0.1 + 0.1,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-sm rounded-[16px] p-4 border border-white/10 aspect-square relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="h-8 w-8 bg-white/10 rounded-xl relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'linear',
                    delay: i * 0.1,
                  }}
                />
              </div>
              <div className="h-4 bg-white/10 rounded-lg w-full relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'linear',
                    delay: i * 0.1,
                  }}
                />
              </div>
              <div className="h-3 bg-white/10 rounded-lg w-2/3 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'linear',
                    delay: i * 0.1 + 0.1,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'widget') {
    return (
      <div className={`bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-xl p-4 ${className}`}>
        {/* Header skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-white/10 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              variants={shimmer}
              initial="initial"
              animate="animate"
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: 'linear',
              }}
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-white/10 rounded-lg w-1/3 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                variants={shimmer}
                initial="initial"
                animate="animate"
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'linear',
                }}
              />
            </div>
            <div className="h-2 bg-white/10 rounded-lg w-1/4 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                variants={shimmer}
                initial="initial"
                animate="animate"
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'linear',
                  delay: 0.1,
                }}
              />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/10 rounded-[14px] relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                variants={shimmer}
                initial="initial"
                animate="animate"
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'linear',
                  delay: i * 0.2,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-[16px] p-4 border border-white/10 relative overflow-hidden ${className}`}>
      <div className="space-y-3">
        <div className="h-32 bg-white/10 rounded-lg relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            variants={shimmer}
            initial="initial"
            animate="animate"
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
          />
        </div>
        <div className="h-4 bg-white/10 rounded-lg w-3/4 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            variants={shimmer}
            initial="initial"
            animate="animate"
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
              delay: 0.1,
            }}
          />
        </div>
        <div className="h-3 bg-white/10 rounded-lg w-1/2 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            variants={shimmer}
            initial="initial"
            animate="animate"
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
              delay: 0.2,
            }}
          />
        </div>
      </div>
    </div>
  );
};
