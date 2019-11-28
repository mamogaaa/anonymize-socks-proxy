const { readFileSync } = require('fs');
const { resolve } = require('path');
const cli = require('commander');
const { version } = require('./package.json');
const { createServer } = require('./server');
const fp = require("find-free-port");

const optionNames = [
  'socks',
  'port',
  'level',
  'config',
  'host',
];

function getFileConfig(filePath) {
  const absFile = resolve(process.cwd(), filePath);

  const content = readFileSync(absFile).toString('utf8');

  let fileConfig = null;

  try {
    fileConfig = JSON.parse(content);
  } catch (err) {
    const error = new Error(`invalid json content: ${err.message}`);
    error.code = err.code;
    throw error;
  }

  return fileConfig;
}

function getOptionsArgs(args) {
  const options = {};

  optionNames.forEach((name) => {
    if (Object.hasOwnProperty.apply(args, [name])) {
      if (typeof args[name] !== 'string') {
        throw new Error(`string "${name}" expected`);
      }
      options[name] = args[name];
    }
  });

  return options;
}

function main() {
  cli.version(version)
    .option('-s, --socks [socks]', 'specify your socks proxy host, default: 127.0.0.1:1080')
    .option('-p, --port [port]', 'specify the listening port of http proxy server, default: 8080')
    .option('-l, --host [host]', 'specify the listening host of http proxy server, default: 127.0.0.1')
    .option('-c, --config [config]', 'read configs from file in json format')
    .option('--level [level]', 'log level, vals: info, error')
    .parse(process.argv);

  const options = getOptionsArgs(cli);

  let fileConfig = null;

  if (options.config) {
    fileConfig = getFileConfig(options.config);
  }

  Object.assign(options, fileConfig);

  console.log(options)
  createServer(options);
}

async function anonymizeProxy(url, port) {
  if (!port) port = await new Promise((resolve, reject) => {
    fp(10000, 15000, function (err, freePort) {
      if (err) return reject(err);
      resolve(freePort);
    });
  });
  url = new URL(url);
  return {
    server: createServer({
      socks: `${url.hostname}:${url.port}:${url.username}:${url.password}`,
      port
    }),
    url: `http://127.0.0.1:${port}`
  }
}

module.exports = {
  getOptionsArgs,
  main,
  anonymizeProxy
};