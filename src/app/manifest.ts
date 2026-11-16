import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Annual Evaluation Dashboard',
    short_name: 'Annual Evaluation',
    description: 'Annual Evaluation & Performance Analytics Dashboard',
    start_url: '/',
    display: 'standalone',
    background_color: '#07130F',
    theme_color: '#1C6B53',
    orientation: 'any',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
