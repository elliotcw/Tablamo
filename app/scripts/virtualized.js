/* global d3 */
(function () {
  'use strict';

  function Tablamo (element, columns, data) {
    this._element = element;
    this._columns = columns;
    this._data = data.map(function (row, i) {
      row.rowIndex = i;
      return row;
    });

    this.createTable(element);
    this.bindDataToTableHeader(element, columns);
    // this.bindDataToTableBody(element, columns, data);

    var worker = new Worker('scripts/filter-worker.js');

    worker.addEventListener('message', function(e) {
      console.log(_.pluck(e.data, 'rowIndex'));
      this.bindDataToTableBody(this._element, this._columns, e.data);
    }.bind(this), false);

    var self = this;

    this._rows.on('scroll', _.debounce(function () {
      worker.postMessage({rows: self._data, scrollTop: this.scrollTop});
    }, 100));

    worker.postMessage({rows: this._data});
  }

  Tablamo.prototype.createTable = function (element) {
    this._element = d3.select(element).classed('tablamo-container', true);

    this._header = this._element
      .append('div')
      .classed('tablamo-header', true);

    this._rows = this._element
      .append('div')
      .classed('tablamo-body', true);
  };

  Tablamo.prototype.bindDataToTableHeader = function (element, columns) {
    var columnHeaders = this._header
      .append('div')
      .classed('tablamo-row', true)
      .classed('tablamo-header-row', true)
        .selectAll('div')
        .data(columns);

    columnHeaders.html(function (d) {
      return d.field;
    });

    columnHeaders.enter()
      .append('div')
      .classed('tablamo-cell', true)
      .html(function (d) {
        return d.field;
      });

    columnHeaders.exit()
      .remove();
  };

  Tablamo.prototype.bindDataToTableBody = function (element, columns, data) {

    this._rows.style('height', this._data.length * 26);

    var rows = this._rows
      .selectAll('div')
      .data(data)
      .style('top', function (d) {
        return (26 * d.rowIndex) + 'px';
      });

    rows.enter()
      .append('div')
      .classed('tablamo-row', true)
      .style('top', function (d) {
        return (26 * d.rowIndex) + 'px';
      })
      .html(function (d, i) {
        return i;
      });

    rows.exit()
      .remove();

    // var cells = rows.selectAll('div').data(function (d) {
    //   var row = [];

    //   columns.forEach(function (column, i) {
    //     var cell = {};
    //     cell.value = d[column.field];
    //     row[i] = cell;
    //   });

    //   return row;
    // });

    // cells.html(function (d) {
    //   return d.value;
    // });

    // cells.enter()
    //   .append('div')
    //   .classed('tablamo-cell', true)
    //   .html(function (d) {
    //     return d.value;
    //   });

    // cells.exit()
    //   .remove();
  };

  Tablamo.prototype.setColumns = function (columns) {
    this._columns = columns;
    this.bindDataToTableHeader(this._element, columns);
  };

  Tablamo.prototype.setData = function (data) {
    this._data = data;
    this.bindDataToTableBody(this._element, this._columns, data);
  };

  function generateData(columns) {
    var data = [];

    var generateCell = function (column) {
      row[column.field] = (column.field === 'id') ? i : Math.random();
    };

    for (var i = 0; i < 100; i++) {
      var row = {};

      columns.forEach(generateCell);

      data[i] = row;
    }

    return data;
  }

  var columns = [{field: 'id'}, {field: 'one'}, {field: 'two'}, {field: 'three'}];
  var data = generateData(columns);

  var tablamo = new Tablamo(document.body, columns, data);
  
  // setInterval(function () {
  //   tablamo.setData(generateData(columns));
  // }, 1000);
})();
