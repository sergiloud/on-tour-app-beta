import React from 'react';

interface TrustSectionProps {
  className?: string;
}

const clientLogos = [
  { name: 'Coachella', logo: '🎪' },
  { name: 'The Lumineers', logo: '🎸' },
  { name: 'Rolling Stone', logo: '📰' },
  { name: 'Live Nation', logo: '🎭' },
  { name: 'Spotify', logo: '🎵' },
  { name: 'Warner Music', logo: '💿' },
];

const testimonials = [
  {
    quote: "Reduced our internal communication by 50% and eliminated itinerary errors. This is the future of tour management.",
    name: "Sarah Chen",
    role: "Production Manager, The Lumineers",
    avatar: "👩‍💼"
  },
  {
    quote: "Finally, a tool that understands the chaos of touring. Our margins improved 30% in the first quarter alone.",
    name: "Marcus Rodriguez",
    role: "Tour Manager, Alt-J",
    avatar: "👨‍🎤"
  },
  {
    quote: "The real-time financial tracking gave us confidence to book bigger venues. Game-changing for our growth.",
    name: "Emma Thompson",
    role: "Artist Manager, Tame Impala",
    avatar: "👩‍🎨"
  }
];

export const TrustSection: React.FC<TrustSectionProps> = ({ className = '' }) => {
  return (
    <section className={`w-full bg-gradient-to-b from-ink-900/10 to-ink-900/30 py-16 md:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 animate-fade-in">
            Trusted by Industry Leaders
          </h2>

          <p
            className="text-center text-lg opacity-80 mb-12 max-w-2xl mx-auto animate-fade-in"
            style={{ color: 'var(--text-secondary)', animationDelay: '100ms' }}
          >
            Trusted by the world's leading artists, managers, and festivals to deliver exceptional touring experiences.
          </p>

          {/* Client Logos Carousel */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {clientLogos.map((client, index) => (
              <div
                key={client.name}
                className="flex flex-col items-center gap-2 group cursor-pointer hover-scale"
              >
                <div className="text-4xl md:text-5xl opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:brightness-110">
                  {client.logo}
                </div>
                <span className="text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--text-secondary)' }}>
                  {client.name}
                </span>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="glass p-6 flex flex-col items-center text-center group hover:shadow-[var(--elev-2)] transition-all duration-300 animate-slide-up hover-lift"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="text-4xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  {testimonial.avatar}
                </div>

                <blockquote className="text-sm leading-relaxed mb-6 italic opacity-90">
                  "{testimonial.quote}"
                </blockquote>

                <div className="border-t border-slate-200 dark:border-white/10 pt-4 w-full">
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};