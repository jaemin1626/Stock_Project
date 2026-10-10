import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest { return { name: 'OpenStock 주식 분석', short_name: 'OpenStock', start_url: '/themes', display: 'standalone', background_color: '#182422', theme_color: '#16a085', icons: [{ src: '/analysis-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] }; }
