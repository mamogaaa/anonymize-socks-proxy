const { logger, changeLevel } = require('./logger');
const { createServer: createProxyServer } = require('./proxy_server');

const DEFAULT_OPTIONS = {
  host: '127.0.0.1',
  socks: '127.0.0.1:1080',
  proxyListReloadTimeout: 60,
  port: 8080,
};

function createServer(opts) {
  const options = Object.assign({}, DEFAULT_OPTIONS, opts);

  if (typeof options.level === 'string') {
    changeLevel(logger, options.level);
  }

  const { port, socks, host } = options;

  // eslint-disable-next-line
  return new Promise((resolve, reject) => {
    const server = createProxyServer(options);
    server.listen(port, host, (err) => {
      if (err) return reject(err);
      resolve(server);
    });
  })
}

module.exports = {
  createServer,
};