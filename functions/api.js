const serverless = require('serverless-http');
const app = require('../server');

// Wrap the Express app with serverless-http and specify allowed binary types for file uploads
module.exports.handler = serverless(app, {
  binary: [
    'multipart/form-data',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
});
