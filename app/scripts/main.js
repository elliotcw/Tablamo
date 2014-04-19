(function() {
  'use strict';

  function generateData(columns) {
    var data = [];

    var generateCell = function(column) {
      row[column.field] = (column.field === 'id') ? i : Math.random();
    };

    for (var i = 0; i < 1000; i++) {
      var row = {};

      columns.forEach(generateCell);

      data[i] = row;
    }

    return data;
  }

  var columns = [{
    field: 'id'
  }, {
    field: 'one'
  }, {
    field: 'two'
  }, {
    field: 'three'
  }];
  var data = generateData(columns);

  var tablamo = new Tablamo(document.body, columns, data);
})();
