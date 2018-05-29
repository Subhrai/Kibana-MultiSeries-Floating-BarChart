module.exports = function (kibana) {
  return new kibana.Plugin({
    name: 'multi-line',
    require: ['kibana', 'elasticsearch'],
    uiExports: {
      visTypes: [
        'plugins/multi-line/multiline'
      ]
    }
  });
};