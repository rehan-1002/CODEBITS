import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://codebits-eight.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/vault', '/login', '/upload'],
        disallow: ['/api/auth/', '/viewer/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
