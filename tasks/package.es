let through = require('through2');
let File = require('vinyl');
let packagexml = require('./lib/object2packagexml.es');

module.exports = (path, pkg) => {
  let xml = packagexml(pkg);
  let xmlFile = new File({contents: new Buffer(xml), path: path});
  return through.obj(function (file, enc, cb) {
    if (file !== xmlFile && file.path.endsWith(path)) {
      console.log(file.path);
      cb();
    } else {
      cb(null, file);
    }
  }, function () {
    this.write(xmlFile);
    this.emit('end');
  });
};
