import React from 'react';
import { motion } from 'framer-motion';

type DragPreviewProps = {
  label: string;
  x: number;
  y: number;
  isDragging: boolean;
  color: string;
};

const DragPreview: React.FC<DragPreviewProps> = ({ label, x, y, isDragging, color }) => {
  return (
    <motion.div
      className={`fixed pointer-events-none z-[9999] px-3 py-2 rounded-lg ${color} text-white font-semibold text-sm shadow-2xl backdrop-blur-sm border border-white/20`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isDragging ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{ left: x, top: y }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {label}
      <motion.div
        className="absolute inset-0 rounded-lg border border-white/40"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
  );
};

export default DragPreview;
