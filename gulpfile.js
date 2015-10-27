const gulp = require('gulp');
const zip = require('gulp-zip');
const unzip = require('gulp-unzip');
const through = require('through2');
const file = require('gulp-file');
const deploy = require('gulp-jsforce-deploy');
const retireve = require('./tasks/retrieve.js');
const packagexml = require('./tasks/lib/object2packagexml.js');
const jsforce = require('jsforce');

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
  const apiVersion    = '33.0';
  const singlePackage = true;
  const version       = '33.0';
  const types         = [
    {name: 'Layout', members: 'Account-Account Layout'}
  ];
  const unpackaged = {version, types};
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
  const version = '33.0';
  const dsttypes = [{ name: 'ApexClass', members: ['A'] }];
  const stream = through.obj();
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
  const obj = {};
  const fields = obj.fields = [];
  fields.push({
    fullName: 'MyField__c',
    label: 'MyField',
    length: 255,
    type: 'Text'
  });
  const objectXml = require('./tasks/templates/object.js')(obj);
  through.obj()
    .pipe(file('Account.object', objectXml))
    .pipe(gulp.dest('./pkg/objects/'));
});

gulp.task('fls', () => {
  const fls = (field, readable, editable) => ({field, readable, editable});
  const profile = {};
  profile.custom = true;
  profile.fieldPermissions = [
    fls('Account.MyField__c', true, true)
  ];
  const xml = require('./tasks/templates/profile.js')(profile);
  through.obj()
    .pipe(file('Admin.profile', xml))
    .pipe(gulp.dest('./pkg/profiles/'));
});

gulp.task('layout', (cb) => {
  const column = (field, behavior) => ({field});
  const layout = {};
  layout.layoutSections = [{}];
  const section = layout.layoutSections[0];
  section.style = 'OneColumn';
  const conn = new jsforce.Connection();
  conn.login(SF_USERNAME, SF_PASSWORD, (err, userInfo) => {
    conn.sobject('Account').describe(function(err, meta) {
      if (err) { return console.error(err); }
      const items = meta.fields
          .map((f) => {
            const field = f.name;
            if (/^Billing/.test(f.name) || /^Shipping/.test(f.name) || !f.createable) {
              return null;
            }
            if (! f.nillable && !f.defaultedOnCreate) {
              return {field, behavior: 'Required'};
            }
            if (field === 'CleanStatus') {
              return {field, behavior: 'Readonly'};
            }
            return {field};
          })
          .filter((f) => !!f);
      section.layoutColumns = [{layoutItems: items}];
      const xml = require('./tasks/templates/layout.js')(layout);
      through.obj()
        .pipe(file('Account-AllFields.layout', xml))
        .pipe(gulp.dest('./pkg/layouts/'));
    });
  });
});
