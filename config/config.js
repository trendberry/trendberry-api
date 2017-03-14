'use strict';

module.exports = {
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 8080
  },
  db: {
   // uri: 'mongodb://localhost:27017/tb-admin',
   uri: 'mongodb://trendberry_user:admin123@ds145828.mlab.com:45828/trendberry',
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
      },
      temp: {
        path: './public/uploads/pictures/temp/'
      }
    }
  },
  owasp: {
    allowPassphrases: true,
    maxLength: 128,
    minLength: 8,
    minPhraseLength: 16,
    minOptionalTestsToPass: 5
  },
  pagination: {
    default: {
      limit: 10,
      page: 1,
      sort: '-created'
    }
  }
};