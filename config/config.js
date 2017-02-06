'use strict';

module.exports = {
  server: {
    host: '0.0.0.0',
    port: 8080
  },
  db: {
    uri: 'mongodb://localhost:27017/tb-admin',
    options: {}
  },
  session: {
    secret: process.env.SESSION_SECRET || 'TB'
  },
  uploads: {
    pictures: {
      category: {
        path: './public/uploads/pictures/categories/',
        requiredSize: [640, 640]
      },
      product: {
        path: './public/uploads/pictures/products/',
        requiredSize: [640, 640]
      },
      shop: {
        path: './public/uploads/pictures/shops/',
        requiredSize: [640, 640]
      },
      vendor: {
        path: './public/uploads/pictures/vendors/',
        requiredSize: [640, 640]
      }
    }
  },
  owasp: {
    allowPassphrases: true,
    maxLength: 128,
    minLength: 8,
    minPhraseLength: 16,
    minOptionalTestsToPass: 5
  }
};