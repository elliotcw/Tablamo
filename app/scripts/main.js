(function() {
  'use strict';

  function generateData(columns) {
    var data = [];

    var types = {
      colour: ['blue', 'green', 'yellow', 'white'],
      size: ['tiny', 'small', 'medium', 'large'],
      hungry: ['yes', 'no'],
      weather: ['sun', 'rain', 'smog', 'snow', 'fog']
    };

    function generateCell(column) {
      var type = types[column.field];
      var value;

      if (type) {
        value = type[Math.floor(Math.random() * type.length)];
      } else {
        value = (column.field === 'id') ? i : Math.ceil(Math.random() * 10);
      }

      row[column.field] = value;
    }

    for (var i = 0; i < 10000; i++) {
      var row = {};

      columns.forEach(generateCell);

      data[i] = row;
    }

    return data;
  }

  var columns = [{
    field: 'id',
    width: 30
  }, {
    field: 'colour',
    width: 100
  }, {
    field: 'size',
    width: 60
  }, {
    field: 'hungry',
    name: 'hungry?',
    width: 30
  }, {
    field: 'weather',
    width: 30
  }, {
    field: 'response',
    width: 30
  }];
  var data = generateData(columns);
  var options = {
    sortBy: [{field: 'response', direction: 'ascending'}]
  };

  var tablamo = new Tablamo(data, columns, options, document.body);
})();
