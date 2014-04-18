/* global d3 */
(function () {
  'use strict';

  function Tablamo (element, columns, data) {
    this._element = element;
    this._columns = columns;
    this._data = data;

    this.createTable(element);
    this.bindDataToTableHeader(element, columns);
    this.bindDataToTableBody(element, columns, data);
  }

  Tablamo.prototype.createTable = function (element) {
    this._table = d3.select(element)
      .classed('tablamo-container', true)
      .append('table')
      .classed('tablamo', true);
      
    this._table.append('thead').append('tr');
    this._table.append('tbody');

    this._stickyTable = d3.select(element).append('table').classed('sticky-header', true);
    this._stickyTable.append('thead').append('tr');
    this._stickyTable.append('tbody');
  };

  Tablamo.prototype.bindDataToTableHeader = function (element, columns) {
    var th = this._table.select('tr')
      .selectAll('th')
      .data(columns);

    th.html(function (d) {
      return d.field;
    });

    th.enter()
      .append('th')
      .html(function (d) {
        return d.field;
      });

    th.exit()
      .remove();

    setTimeout(function () {
      this._stickyTable.style('width', this._table.select('thead').style('width'));

      th = this._stickyTable.select('tr')
        .selectAll('th')
        .data(columns);

      th.html(function (d) {
        return d.field;
      });

      th.enter()
        .append('th').html(function (d) {
          return d.field;
        }).style('width', function (d, i) {
          return d3.select('.tablamo th:nth-child(' + (i + 1) +')').style('width');
        });

      th.exit()
        .remove();
    }.bind(this), 199);
  };

  Tablamo.prototype.bindDataToTableBody = function (element, columns, data) {
    var tr = d3.select(element).select('.tablamo tbody').selectAll('tr').data(data);

    tr.enter().append('tr');

    tr.exit().remove();

    var td = tr.selectAll('td').data(function (d) {
      var row = [];

      columns.forEach(function (column, i) {
        var cell = {};
        cell.value = d[column.field];
        row[i] = cell;
      });

      return row;
    });

    td.html(function (d) {
      return d.value;
    });

    td.enter().append('td').html(function (d) {
      return d.value;
    });

    td.exit().remove();
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
