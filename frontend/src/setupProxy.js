const {createProxyMiddleware} = require('http-proxy-middleware');
const backendPaths = ['/api'];

module.exports = function (app) {
    backendPaths.forEach(path => {
        app.use(
            createProxyMiddleware(path, {
                target: 'http://localhost:5000',
                changeOrigin: true
            })
        )
    });
/*    app.use(
        createProxyMiddleware('/websocket', {
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
            ws: true
        })
    )*/
    app.use(
        '/ws',
        createProxyMiddleware( '/ws',{
            target: 'http://localhost:5000',
            changeOrigin: true,
            ws: true,
            secure: false
        })
    );
};