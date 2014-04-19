/* global self */
self.addEventListener('message', function(e) {
  'use strict';

  var options = e.data.options;
  options.scrollTop = options.scrollTop || 0;

  var sortedRows = e.data.rows.sort(function (a, b) {
    return a.rowIndex - b.rowIndex;
  });

  var filteredRows = [];
  var topRow = Math.floor(options.scrollTop / options.rowHeight);
  var bottomRow = topRow + options.visibleRows;

  sortedRows.forEach(function (row) {
    if (row.rowIndex > (topRow - options.offset) && row.rowIndex < (bottomRow + options.offset)) {
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