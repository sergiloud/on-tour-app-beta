import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

type Props = {
  active: boolean;
  dateStr: string;
  onComplete?: () => void;
};

const CellSuccessPulse: React.FC<Props> = ({ active, dateStr, onComplete }) => {
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1000);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  return (
    <>
      {active && (
        <>
          {/* Ring pulse */}
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-accent-400"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ pointerEvents: 'none' }}
          />

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-lg bg-accent-400/20"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ pointerEvents: 'none' }}
          />
        </>
      )}
    </>
  );
};

export default CellSuccessPulse;
