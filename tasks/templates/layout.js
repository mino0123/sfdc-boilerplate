const utils = require('../lib/utils');


function layoutItems(item) {
  return `
  <layoutItems>
      ${ utils.printProp(item, 'behavior') }
      ${ utils.printProp(item, 'field') }
      ${ utils.printProp(item, 'customLink') }
  </layoutItems>`;
}

function layoutColumns(column) {
  return `
  <layoutColumns>
    ${ column.layoutItems.map(layoutItems).join('') }
  </layoutColumns>`;
}

function layoutSections(section) {
  return `
  <layoutSections>
      ${ utils.printProp(section, 'customLabel') }
      ${ utils.printProp(section, 'detailHeading') }
      ${ utils.printProp(section, 'editHeading') }
      ${ utils.printProp(section, 'label') }
      ${ section.layoutColumns.map(layoutColumns).join('') }
      ${ utils.printProp(section, 'style') }
  </layoutSections>`;
}

function quickActionListItems(item) {
  return `
  <quickActionListItems>
      ${ utils.printProp(item, 'quickActionName') }
  </quickActionListItems>`;
}

function quickActionList(list) {
  return `
  <quickActionList>
  ${ list.quickActionListItems.map(quickActionListItems).join('') }
  </quickActionList>`;
}

function relatedContentItems(item) {
  return `
  <quickActionListItems>
      <layoutItem>
          ${ utils.printProp(item, 'component') }
      </layoutItem>
  </quickActionListItems>`;
}

function relatedContent(content) {
  return `
  <relatedContent>
  ${ content.relatedContentItems.map(relatedContentItems).join('') }
  </relatedContent>`;
}

function relatedLists(list) {
  return `
  <relatedLists>
  ${ utils.printProp(list, 'fields') }
  ${ utils.printProp(list, 'relatedList') }
  </relatedLists>`;
}


module.exports = function (layout) {
  layout.layoutSections = layout.layoutSections || [];
  layout.quickActionList = layout.quickActionList || [];
  layout.relatedContent = layout.relatedContent || [];
  layout.relatedLists = layout.relatedLists || [];

  return `<?xml version="1.0" encoding="UTF-8"?>
  <Layout xmlns="http://soap.sforce.com/2006/04/metadata">
    ${ utils.printProp(layout, 'emailDefault') }
    ${ utils.printProp(layout, 'headers') }
    ${ layout.layoutSections.map(layoutSections).join('') }
    ${ layout.quickActionList.map(quickActionList).join('') }
    ${ layout.relatedContent.map(relatedContent).join('') }
    ${ layout.relatedLists.map(relatedLists).join('') }
    ${ utils.printProp(layout, 'relatedObjects') }
    ${ utils.printProp(layout, 'runAssignmentRulesDefault') }
    ${ utils.printProp(layout, 'showEmailCheckbox') }
    ${ utils.printProp(layout, 'showHighlightsPanel') }
    ${ utils.printProp(layout, 'showInteractionLogPanel') }
    ${ utils.printProp(layout, 'showRunAssignmentRulesCheckbox') }
    ${ utils.printProp(layout, 'showSubmitAndAttachButton') }
  </Layout>`;
};
