module.exports = {
  printProp: function (obj, name) {
    if (! obj) {
      return typeof name === 'undefined' ? '' : name;
    }
    const value = obj[name];
    const tagStart = '<' + name + '>';
    const tagEnd = '</' + name + '>';
    if (value) {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return '';
        } else {
          return tagStart + value.join(tagEnd + '\n' + tagStart) + tagEnd;
        }
      }
      return tagStart + obj[name] + tagEnd;
    }
    return '';
  }
};
