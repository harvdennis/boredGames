const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware(['/api'], {
            target: 'https://europe-west1-boredgames-28c8e.cloudfunctions.net',
            changeOrigin: true,
        })
    );
};

/*This file allows for the application to access the firestore database without any errors occuring */
