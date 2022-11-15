const {createProxyMiddleware} = require('http-proxy-middleware');
const backendPaths = ['/api'];

module.exports = function (app) {
    backendPaths.forEach(path => {
        app.use(
            createProxyMiddleware(path, {
                target: 'http://localhost:5000',
                changeOrigin: true,
                ws: true
            })
        )
    });
};