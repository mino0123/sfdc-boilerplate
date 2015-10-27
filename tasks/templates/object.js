const utils = require('../lib/utils');


function actionOverrides(ao) {
  return `
    <actionOverrides>
        <actionName>${ ao.actionName }</actionName>
        <type>${ ao.type }</type>
    </actionOverrides>`;
}

function picklistValues(value, picklist) {
  return `
  <picklistValues>
    <fullName><%= value.fullName %></fullName>
    ${ utils.printProp(value, 'controllingFieldValues') }
    ${ utils.printProp(value, 'default') }
  </picklistValues>

}

function picklist(picklist, field) {
  if (!picklist) { return ''; }
  picklist.picklistValues = picklist.picklistValues || [];
  return `
  <picklist>
    ${ utils.printProp(field, 'controllingField') }
    ${ picklist.picklistValues.map(picklistValues) }
    ${ utils.printProp(picklist, 'sorted') }`;
  </picklist>`;
}

function fields(field) {
  return `
    <fields>
      ${ utils.printProp(field, 'fullName') }
      ${ utils.printProp(field, 'defaultValue') }
      ${ utils.printProp(field, 'externalId') }
      ${ utils.printProp(field, 'label') }
      ${ utils.printProp(field, 'length') }
      ${ utils.printProp(field, 'maskChar') }
      ${ utils.printProp(field, 'maskType') }
      ${ utils.printProp(field, 'precision') }
      ${ utils.printProp(field, 'referenceTo') }
      ${ utils.printProp(field, 'relationshipName') }
      ${ utils.printProp(field, 'required') }
      ${ utils.printProp(field, 'scale') }
      ${ utils.printProp(field, 'summaryForeignKey') }
      ${ utils.printProp(field, 'summaryOperation') }
      ${ picklist(field.picklist, field) }
      ${ utils.printProp(field, 'trackFeedHistory') }
      ${ utils.printProp(field, 'trackHistory') }
      ${ utils.printProp(field, 'type') }
      ${ utils.printProp(field, 'unique') }
      ${ utils.printProp(field, 'visibleLines') }
    </fields>`;
}

function nameField(nameField) {
  if (!nameField) { return ''; }
  return `
  <nameField>
    ${ utils.printProp(nameField, 'visibleLines') }
    ${ printProp(nameField, 'label') }
    ${ printProp(nameField, 'length') }
    ${ printProp(nameField, 'type') }
  </nameField>`;
}


module.exports = function (metadata) {
  metadata.actionOverrides = metadata.actionOverrides || [];
  metadata.fields = metadata.fields || [];
  return `<?xml version="1.0" encoding="UTF-8"?>
  <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
  ${ metadata.actionOverrides.map(actionOverrides).join('') }
  ${ utils.printProp(metadata, 'compactLayoutAssignment') }
  ${ utils.printProp(metadata, 'enableEnhancedLookup') }
  ${ utils.printProp(metadata, 'enableFeeds') }
  ${ utils.printProp(metadata, 'enableHistory') }
  ${ metadata.fields.map(fields).join('') }
  ${ utils.printProp(metadata, 'deploymentStatus') }
  ${ utils.printProp(metadata, 'recordTypeTrackFeedHistory') }
  ${ utils.printProp(metadata, 'recordTypeTrackHistory') }
  ${ utils.printProp(metadata, 'sharingModel') }
  ${ nameField(metadata.nameField) }
  ${ utils.printProp(metadata, 'label') }
  </CustomObject>`
};
