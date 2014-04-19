/* global self */
self.addEventListener('message', function(e) {
  'use strict';

  var options = e.data.options;
  options.scrollTop = options.scrollTop || 0;

  var sortedRows = e.data.rows.sort(function (a, b) {
    return a.rowIndex - b.rowIndex;
  });

  var filteredRows = [];
  var topRow = options.scrollTop / options.rowHeight;
  var bottomRow = topRow + options.visibleRows;

  var minRow = Math.floor(topRow - options.offset);
  var maxRow = Math.ceil(bottomRow + options.offset);

  console.log('before' + minRow);

  minRow = (minRow % 2) ? minRow - 1 : minRow;

  console.log(minRow);

  sortedRows.forEach(function (row) {
    if (row.rowIndex >= minRow && row.rowIndex < maxRow) {
      filteredRows.push(row);
    }
  });

  filteredRows = filteredRows.map(function (row) {
    return {
      key: row.rowIndex,
      values: e.data.columns.map(function (column) {
        return row[column.field];
      })
    };
  });

  self.postMessage({rows: filteredRows});
}, false);