import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/backoffice/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/backoffice/', '/api/', '/dashboard/'],
      },
    ],
    sitemap: 'https://imoveismais-site.vercel.app/sitemap.xml',
  };
}
