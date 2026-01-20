module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'https://site-escola-five-sand.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
        'https://strapi-final-funcional.onrender.com',
        'http://strapi-final-funcional.onrender.com'
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  {
    name: 'strapi::query',
    config: {
      defaultLimit: 100,
    },
  },
  'strapi::body',
  {
    name: 'strapi::session',
    config: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  'strapi::favicon',
  'strapi::public',
];