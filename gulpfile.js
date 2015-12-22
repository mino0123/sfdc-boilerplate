const gulp = require('gulp');
const zip = require('gulp-zip');
const unzip = require('gulp-unzip');
const through = require('through2');
const file = require('gulp-file');
const deploy = require('gulp-jsforce-deploy');
const retireve = require('./tasks/retrieve.js');
const jsforce = require('jsforce');
const metadata = require('salesforce-metadata-xml-builder');

const API_VERSION = '35.0';
const SF_USERNAME = process.env.SF_USERNAME;
const SF_PASSWORD = process.env.SF_PASSWORD;

gulp.task('retrieve', (cb) => {
  const retrieveArgs = {
    apiVersion: API_VERSION,
    singlePackage: true,
    unpackaged: {
      types: [{ name: 'Profile', members: ['*'] }],
      version: API_VERSION
    }
  };
  retireve({
    username: SF_USERNAME,
    password: SF_PASSWORD,
    retrieve: retrieveArgs
  })
    .on('error', cb)
    .pipe(unzip())
    .pipe(gulp.dest('./pkg'));
});

gulp.task('delete', () => {
  const version = API_VERSION;
  const dsttypes = [{ name: 'ApexClass', members: ['A'] }];
  const packagexml = metadata.Package({ version, types: [] });
  const destructivexml = metadata.Package({ version, types: dsttypes });
  const stream = through.obj();
  stream
    .pipe(file('pkg/package.xml', packagexml))
    .pipe(file('pkg/destructiveChanges.xml', destructivexml))
    .pipe(zip('pkg.zip'))
    .pipe(deploy({
      username: SF_USERNAME,
      password: SF_PASSWORD
    }));
  stream.push();
});

gulp.task('deploy-field', () => {
  const object = {
    fullName: 'Account',
    fields: []
  };
  object.fields.push({
    fullName: 'MyField__c',
    label: 'MyField',
    length: 255,
    type: 'Text'
  });
  const objectxml = metadata.CustomObject(object);
  const packagexml = metadata.Package({
    types: [{ name: 'CustomObject', members: ['Account'] }],
    version: API_VERSION
  });
  const objectStream = through.obj()
    .pipe(file('src/objects/Account.object', objectxml, { src: true }))
    .pipe(file('src/package.xml', packagexml))
    .pipe(zip('pkg.zip'))
    .pipe(deploy({
      username: SF_USERNAME,
      password: SF_PASSWORD
    }));
});

gulp.task('deploy-fls', () => {
  const fls = (field, readable, editable) => ({field, readable, editable});
  const profilexml = metadata.Profile({
    custom: true,
    fieldPermissions: [fls('Account.MyField__c', true, true)]
  });
  const packagexml = metadata.Package({
    types: [{ name: 'Profile', members: ['Admin'] }],
    version: API_VERSION
  });
  through.obj()
    .pipe(file('src/profiles/Admin.profile', profilexml, { src: true }))
    .pipe(file('src/package.xml', packagexml))
    .pipe(zip('pkg.zip'))
    .pipe(deploy({
      username: SF_USERNAME,
      password: SF_PASSWORD
    }));
});

gulp.task('deploy-layout', (cb) => {
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
      const layoutxml = metadata.Layout(layout);
      const packagexml = metadata.Package({
        types: [{ name: 'Layout', members: ['Account-AllFields'] }],
        version: API_VERSION
      });
      through.obj()
        .pipe(file('src/layouts/Account-AllFields.layout', layoutxml, { src: true }))
        .pipe(file('src/package.xml', packagexml))
        .pipe(zip('pkg.zip'))
        .pipe(deploy({
          username: SF_USERNAME,
          password: SF_PASSWORD
        }));
    });
  });
});
