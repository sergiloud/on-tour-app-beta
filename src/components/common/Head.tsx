import React from 'react';

interface HeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
}

export const Head: React.FC<HeadProps> = ({
  title = 'On Tour - Your Tour, Elevated',
  description = 'Transform your tour management with intelligent insights, real-time collaboration, and data-driven decisions. Perfect for artists, managers, and agencies.',
  keywords = 'tour management, artist management, concert planning, music industry, tour logistics, performance tracking',
  ogImage = '/og-image.png',
  url = 'https://on-tour.app'
}) => {
  React.useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:url', url, true);
    updateMeta('og:type', 'website', true);

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    // Additional SEO tags
    updateMeta('robots', 'index, follow');
    updateMeta('author', 'On Tour Team');

  }, [title, description, keywords, ogImage, url]);

  return null; // This component doesn't render anything
};