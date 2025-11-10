import React from 'react';
import { useI18n } from '../../lib/i18n';

export const SiteFooter: React.FC = () => {
  const { lang } = useI18n();
  const isSpanish = lang === 'es';

  const columns = [
    {
      title: isSpanish ? 'Producto' : 'Product',
      items: [
        { label: isSpanish ? 'Funciones' : 'Features', href: '#features' },
        { label: isSpanish ? 'Precios' : 'Pricing', href: '#pricing' },
        { label: isSpanish ? 'Demo interactiva' : 'Interactive demo', href: '#hero' },
        { label: isSpanish ? 'Integraciones' : 'Integrations', href: '#integrations' }
      ]
    },
    {
      title: isSpanish ? 'Soluciones' : 'Solutions',
      items: [
        { label: isSpanish ? 'Para Tour Managers' : 'For Tour Managers', href: '#testimonials' },
        { label: isSpanish ? 'Para Artistas' : 'For Artists', href: '#features' },
        { label: isSpanish ? 'Para Agencias' : 'For Agencies', href: '#kpis' },
        { label: isSpanish ? 'Para Festivales' : 'For Festivals', href: '#trust' }
      ]
    },
    {
      title: isSpanish ? 'Empresa' : 'Company',
      items: [
        { label: isSpanish ? 'Sobre nosotros' : 'About', href: '#about' },
        { label: 'Blog', href: '#blog' },
        { label: isSpanish ? 'Carreras' : 'Careers', href: '#careers' },
        { label: isSpanish ? 'Contacto' : 'Contact', href: '#contact' }
      ]
    },
    {
      title: isSpanish ? 'Legal' : 'Legal',
      items: [
        { label: isSpanish ? 'Privacidad' : 'Privacy', href: '#privacy' },
        { label: isSpanish ? 'Términos de servicio' : 'Terms of Service', href: '#terms' },
        { label: isSpanish ? 'Cookies' : 'Cookies', href: '#cookies' },
        { label: isSpanish ? 'Seguridad' : 'Security', href: '#security' }
      ]
    }
  ];

  const newsletterCopy = {
    title: isSpanish ? 'Mantente delante de la curva' : 'Stay ahead of the curve',
    description: isSpanish
      ? 'Recibe insights exclusivos sobre tendencias en la industria musical y consejos para optimizar tus giras.'
      : 'Get touring insights, performance tactics, and savings tips crafted for touring teams.',
    placeholder: isSpanish ? 'tu@email.com' : 'you@email.com',
    button: isSpanish ? 'Suscribirme' : 'Subscribe',
    disclaimer: isSpanish ? 'Sin spam, cancela cuando quieras.' : 'No spam. Unsubscribe anytime.'
  };

  return (
    <footer id="footer" className="relative z-10 px-6 pb-10 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">{column.title}</h3>
            <ul className="space-y-2 text-sm" style={{color:'var(--text-secondary)'}}>
              {column.items.map((item) => (
                <li key={`${column.title}-${item.label}`}>
                  <a href={item.href} className="hover:text-white transition">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Newsletter CTA Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="glass p-8 text-center">
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{newsletterCopy.title}</h3>
          <p className="text-sm mb-6 opacity-80" style={{color:'var(--text-secondary)'}}>
            {newsletterCopy.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={newsletterCopy.placeholder}
              className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition"
              aria-label={isSpanish ? 'Introduce tu correo electrónico para suscribirte al boletín' : 'Enter your email address for the newsletter'}
              required
            />
            <button 
              className="btn-primary px-6 py-3 whitespace-nowrap"
              type="submit"
              aria-label={isSpanish ? 'Confirmar suscripción al boletín' : 'Confirm newsletter subscription'}
            >
              {newsletterCopy.button}
            </button>
          </div>
          <p className="text-xs mt-3 opacity-60" style={{color:'var(--text-secondary)'}}>
            {newsletterCopy.disclaimer}
          </p>
        </div>
      </div>

      {/* Social Links */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-center gap-6" role="list" aria-label="Follow us on social media">
          <a href="#" className="text-blue-400 hover:text-blue-300 transition transform hover:scale-110" aria-label="Follow us on Twitter" role="listitem">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </a>
          <a href="#" className="text-blue-600 hover:text-blue-500 transition transform hover:scale-110" aria-label="Follow us on Facebook" role="listitem">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
            </svg>
          </a>
          <a href="#" className="text-pink-500 hover:text-pink-400 transition transform hover:scale-110" aria-label="Follow us on Instagram" role="listitem">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.75.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.747-1.378 0 0-.599 2.282-.744 2.84-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
            </svg>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-sm flex flex-col md:flex-row gap-4 md:items-center justify-between border-t border-slate-200 dark:border-white/10 pt-6" style={{color:'var(--text-secondary)'}}>
        <p>
          © {new Date().getFullYear()} On Tour App. {isSpanish ? 'Todos los derechos reservados.' : 'All rights reserved.'}
        </p>
        <div className="flex gap-6">
          <a href="#privacy" className="transition hover:text-slate-900 dark:hover:text-white">{isSpanish ? 'Privacidad' : 'Privacy'}</a>
          <a href="#terms" className="transition hover:text-slate-900 dark:hover:text-white">{isSpanish ? 'Términos' : 'Terms'}</a>
          <a href="#cookies" className="transition hover:text-slate-900 dark:hover:text-white">Cookies</a>
        </div>
      </div>
    </footer>
  );
};
