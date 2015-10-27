const jsforce = require('jsforce');
const through = require('through2');
const File = require('vinyl');

module.exports = (options) => {
  options = options || {};
  const stream = through.obj();
  const config = [
    'loginUrl',
    'accessToken',
    'instanceUrl',
    'refreshToken',
    'clientId',
    'clientSecret',
    'redirectUri',
    'logLevel',
    'version'
  ].reduce((c, k) => (c[k] = options[k], c), {});
  const conn = new jsforce.Connection(config);
  conn
    .login(options.username, options.password)
    .then(() => {
      conn.metadata.pollInterval = options.pollInterval || 5e3;
      conn.metadata.pollTimeout = options.pollTimeout || 60e3;
      return conn
        .metadata.retrieve(options.retrieve).complete({ details: true });
    }, err => {
      stream.emit('error', new Error(err.message));
    })
    .then(res => {
      if (res.success) {
        const buf = new Buffer(res.zipFile, 'base64');
        stream.write(new File({contents: buf}));
        // stream.end();
      } else {
        stream.emit('error', new Error('Retrieve failed.'));
      }
    });
  return stream;
};
