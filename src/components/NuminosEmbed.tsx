import React, { useEffect } from 'react';

// Small loader component that injects the NuminOS embed script if the feature flag is enabled.
// This keeps changes minimal: one React component import in the main app.

const NuminosEmbed: React.FC = () => {
  useEffect(() => {
    const enabled = import.meta.env.VITE_NUMINOS_ENABLED === 'true' || import.meta.env.VITE_NUMINOS_ENABLED === '1';
    if (!enabled) return;

    // Avoid injecting multiple times
    if (document.getElementById('numinos-embed-script')) return;

    const script = document.createElement('script');
    script.id = 'numinos-embed-script';
    // In production this should point to the sidecar's hosted embed (e.g. https://numinos-service.example/embed.js)
    // For now, load the local dev widget if present under /numinos-widget/embed.js (not bundled by default)
    script.src = '/numinos-widget/embed.js';
    script.async = true;
    script.onload = () => {
      // widget may expose a global initializer
      try {
        // @ts-ignore
        if (window?.NuminosWidget?.init) {
          // @ts-ignore
          window.NuminosWidget.init({ hostOrigin: window.location.origin });
        }
      } catch (e) {
        // ignore
      }
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
};

export default NuminosEmbed;
