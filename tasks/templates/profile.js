const utils = require('../lib/utils');

function fieldPermissions(permission) {
  return `
  <fieldPermissions>
    <editable>${ permission.editable }</editable>
    <field>${ permission.field }</field>
    <readable>${ permission.readable }</readable>
  </fieldPermissions>`;
}

function objectPermissions(permission) {
  return `
    <objectPermissions>
      <allowCreate>${ permission.allowCreate }</allowCreate>
      <allowDelete>${ permission.allowDelete }</allowDelete>
      <allowEdit>${ permission.allowEdit }</allowEdit>
      <allowRead>${ permission.allowRead }</allowRead>
      <modifyAllRecords>${ permission.modifyAllRecords }</modifyAllRecords>
      <object>${ permission.object }</object>
      <viewAllRecords>${ permission.viewAllRecords }</viewAllRecords>
    </objectPermissions>`;
}


module.exports = function (metadata) {
  metadata.fieldPermissions = metadata.fieldPermissions || [];
  metadata.objectPermissions = metadata.objectPermissions || [];

  return `<?xml version="1.0" encoding="UTF-8"?>
<Profile xmlns="http://soap.sforce.com/2006/04/metadata">
  ${ utils.printProp(metadata, 'custom') }
  ${ metadata.fieldPermissions.map(fieldPermissions).join('') }
  ${ metadata.objectPermissions.map(objectPermissions).join('') }
</Profile>`
};
