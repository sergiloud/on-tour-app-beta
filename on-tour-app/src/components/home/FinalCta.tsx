import { motion } from 'framer-motion';
import { useI18n } from '../../lib/i18n';

interface FinalCtaProps {
  title: string;
  subtitle: string;
  cta: string;
  href?: string;
}

export function FinalCta({ title, subtitle, cta, href = '/register' }: FinalCtaProps) {
  const { lang } = useI18n();
  const isSpanish = lang === 'es';
  const learnMoreLabel = isSpanish ? 'Conocer más' : 'Learn more';

  return (
    <motion.section
      className="glass relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-ink-900/80 to-ink-800/60 px-8 py-12 text-center shadow-[var(--elev-2)]"
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.45, ease: 'easeOut' as const }}
      aria-labelledby="home-final-cta-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_60%)]" aria-hidden="true" />
      <div className="relative z-10">
        <h2 id="home-final-cta-heading" className="text-3xl font-semibold text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/75">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={href}
            className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-base"
          >
            {cta}
          </a>
          <a
            href="#features"
            className="btn-ghost inline-flex items-center justify-center px-6 py-3 text-base"
          >
            {learnMoreLabel}
          </a>
        </div>
      </div>
    </motion.section>
  );
}
