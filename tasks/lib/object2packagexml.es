module.exports = (obj) => {
  let types = obj.types.map(type => {
    let members = type.members.map(
      m => '\t\t<members>' + m + '</members>'
    ).join('\n');
    return `\t<types>
${members}
\t\t<name>${type.name}</name>
\t</types>`;
  }).join('\n');
  let version = obj.version || '33.0';
  return `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
${ types }
\t<version>${ obj.version }</version>
</Package>`;
};
