let gulp = require('gulp');
let zip = require('gulp-zip');
let unzip = require('gulp-unzip');
let through = require('through2');
let deploy = require('gulp-jsforce-deploy');
let retireve = require('./tasks/retrieve.es');
let pkgxml = require('./tasks/package.es');

const SF_USERNAME = process.env.SF_USERNAME;
const SF_PASSWORD = process.env.SF_PASSWORD;

gulp.task('deploy', () => {
  gulp
    .src('pkg/**', { base: '.' })
    .pipe(zip('pkg.zip'))
    .pipe(deploy({
      username: SF_USERNAME,
      password: SF_PASSWORD
    }));
});

gulp.task('retrieve', (cb) => {
  let apiVersion    = '33.0';
  let singlePackage = true;
  let version       = '33.0';
  let types         = [
    {name: 'ApexClass', members: 'AA'}
  ];
  let unpackaged = {version, types};
  retireve({
    username: SF_USERNAME,
    password: SF_PASSWORD,
    retrieve: {apiVersion, singlePackage, unpackaged}
  })
    .on('error', cb)
    .pipe(unzip())
    .pipe(gulp.dest('./pkg'));
});

gulp.task('delete', (cb) => {
  let version = '33.0';
  let dsttypes = [{ name: 'ApexClass', members: ['A'] }];
  let stream = through.obj();
  stream
    .pipe(pkgxml('pkg/package.xml', { version, types: [] }))
    .pipe(pkgxml('pkg/destructiveChanges.xml', { version, types: dsttypes }))
    .pipe(zip('pkg.zip'))
    .on('finish', function () {
      this
        // .pipe(gulp.dest('delete/'))
        .pipe(deploy({
          username: SF_USERNAME,
          password: SF_PASSWORD
        }));
    });
  stream.push();
});
