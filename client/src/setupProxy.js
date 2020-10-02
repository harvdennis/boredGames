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
