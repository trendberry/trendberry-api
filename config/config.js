'use strict';

module.exports = {
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 8080
  },
  db: {
    // uri: 'mongodb://localhost:27017/tb-admin',
    uri: 'mongodb://trendberry_user:admin123@cluster0-shard-00-00-zbrf4.mongodb.net:27017,cluster0-shard-00-01-zbrf4.mongodb.net:27017,cluster0-shard-00-02-zbrf4.mongodb.net:27017/trendberry_data?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
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
        requiredSize: {
          x: 640,
          y: 640
        }
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
  jwtSecret: '1234567890asdfghjnj',
  pagination: {
    default: {
      limit: 10,
      page: 1,
      sort: '-created'
    }
  },
  import: {
    downloadPath: '',
    logPath: './logs/import',
    maxParallelCount: 1
  }
};