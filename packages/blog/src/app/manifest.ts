import type { MetadataRoute } from 'next'

// Lets phones save the site to the home screen with its name, icon and colors.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'White Emotion',
    short_name: 'White Emotion',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F4',
    theme_color: '#9A7424',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
