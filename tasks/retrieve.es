let jsforce = require('jsforce');
let through = require('through2');
let File = require('vinyl');

module.exports = (options = {}) => {
  let stream = through.obj();
  let config = [
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
  let conn = new jsforce.Connection(config);
  conn
    .login(options.username, options.password)
    .then(() => {
      conn.metadata.pollInterval = options.pollInterval || 60e3;
      conn.metadata.pollInterval = options.pollTimeout || 5e3;
      return conn
        .metadata.retrieve(options.retrieve).complete({ details: true });
    }, err => {
      stream.emit('error', new Error(err.message));
    })
    .then(res => {
      if (res.success) {
        let buf = new Buffer(res.zipFile, 'base64');
        stream.write(new File({contents: buf}));
        stream.end();
      } else {
        stream.emit('error', new Error('Retrieve failed.'));
      }
    });
  return stream;
};
