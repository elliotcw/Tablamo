self.addEventListener('message', function(e) {

  var sortedRows = e.data.rows.sort(function (a, b) {
    return a.rowIndex - b.rowIndex;
  });

  var filteredRows = [];

  sortedRows.forEach(function (row) {
    if (!e.data.scrollTop || row.rowIndex > (e.data.scrollTop / 26)) {
      filteredRows.push(row);
    }
  });

  self.postMessage(filteredRows);
}, false);