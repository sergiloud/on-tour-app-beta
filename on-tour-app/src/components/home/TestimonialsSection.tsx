import { motion, useReducedMotion } from 'framer-motion';
import type { Testimonial } from '../../types/homeLegacy';
import { OptimizedImage, getBlurDataURL } from '../common/OptimizedImage';

type TestimonialsSectionProps = {
  items: Testimonial[];
};

const container = {
  hidden: { opacity: 0 },
  visible: (prefersReducedMotion: boolean) => ({
    opacity: 1,
    transition: prefersReducedMotion
      ? undefined
      : {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
  })
};

const item = (prefersReducedMotion: boolean) =>
  prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
      hidden: { opacity: 0, y: 24 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' as const }
      }
    };

export function TestimonialsSection({ items }: TestimonialsSectionProps) {
  const reduceMotion = useReducedMotion();
  const prefersReducedMotion = Boolean(reduceMotion);

  return (
    <motion.div
      role="list"
      className="grid gap-6 sm:grid-cols-2"
      variants={container}
      initial="hidden"
      animate="visible"
      custom={prefersReducedMotion}
    >
      {items.map((testimonial) => (
        <motion.figure
          key={testimonial.id}
          role="listitem"
          className="glass flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-white/5 p-6"
          variants={item(prefersReducedMotion)}
        >
          <blockquote className="text-base text-white/90">
            “{testimonial.quote}”
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3 text-sm text-white/70">
            {testimonial.avatarUrl ? (
              <OptimizedImage
                src={testimonial.avatarUrl}
                alt={testimonial.author}
                className="h-10 w-10 rounded-full"
                objectFit="cover"
                width={40}
                height={40}
                blurDataURL={getBlurDataURL(testimonial.avatarUrl)}
              />
            ) : null}
            <div>
              <span className="block font-medium text-white">{testimonial.author}</span>
              <span className="block text-xs uppercase tracking-[0.2em] text-white/50">
                {testimonial.role}
              </span>
            </div>
          </figcaption>
        </motion.figure>
      ))}
    </motion.div>
  );
}
