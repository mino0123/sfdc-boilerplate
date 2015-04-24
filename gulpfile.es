let gulp = require('gulp');
let zip = require('gulp-zip');
let unzip = require('gulp-unzip');
let through = require('through2');
let file = require('gulp-file');
let template = require('gulp-template');
let rename = require('gulp-rename');
let deploy = require('gulp-jsforce-deploy');
let retireve = require('./tasks/retrieve.es');
let packagexml = require('./tasks/lib/object2packagexml.es');

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

gulp.task('delete', () => {
  let version = '33.0';
  let dsttypes = [{ name: 'ApexClass', members: ['A'] }];
  let stream = through.obj();
  stream
    .pipe(file('pkg/package.xml', packagexml({ version, types: [] })))
    .pipe(file('pkg/destructiveChanges.xml', packagexml({ version, types: dsttypes })))
    .pipe(zip('pkg.zip'))
    .pipe(deploy({
      username: SF_USERNAME,
      password: SF_PASSWORD
    }));
  stream.push();
});

gulp.task('field', () => {
  let obj = {};
  let fields = obj.fields = [];
  fields.push({
    fullName: 'MyField__c',
    label: 'MyField',
    length: 255,
    type: 'Text'
  });
  gulp.src('./tasks/templates/object.template')
    .pipe(template({object: obj}))
    .pipe(rename("Account.object"))
    .pipe(gulp.dest('./pkg/objects/'));
});

gulp.task('fls', () => {
  let fls = (field, readable, editable) => ({field, readable, editable});
  let profile = {};
  profile.custom = true;
  profile.fieldPermissions = [
    fls('Account.MyField__c', true, true)
  ];
  gulp.src('./tasks/templates/profile.template')
    .pipe(template({profile: profile}))
    .pipe(rename('Admin.profile'))
    .pipe(gulp.dest('./pkg/profiles/'));
});
