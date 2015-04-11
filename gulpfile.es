let gulp = require('gulp');
let zip = require('gulp-zip');
let unzip = require('gulp-unzip');
let deploy = require('gulp-jsforce-deploy');
let retireve = require('./tasks/retrieve.es');

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
    {name: 'CustomObject', members: 'Account'}
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
