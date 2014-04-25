/* global define */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['d3', 'lodash', 'tablamo-data'], factory);
  } else {
    root.Tablamo = factory(root.d3, root._, root.Tablamo.DataModel);
  }
}(this, function(d3, _, DataModel) {
  'use strict';

  function Tablamo(element, columns, data, options) {
    this.element = element;
    this.model = new DataModel({
      data: data,
      columns: columns,
      options: options
    });

    this.model.on('change:data', this.refreshData.bind(this));
    this.model.on('change:columns', this.refreshColumns.bind(this));
    this.model.on('change:pivot', this.refreshPivot.bind(this));
    this.model.on('change:sort', this.refreshSort.bind(this));

    this.model.on('change:options', this.refreshAll.bind(this));

    this.refreshAll();
  }

  Tablamo.prototype.refreshData = function () {
    var table = this.drawTable();
    
    this.refreshSort();
    this.refreshPivot();

    var columns = this.model.get('columns');
    
    var tbody = table.selectAll('tbody')
      .data(function (d) {
        return [d];
      });

    tbody.enter()
      .append('tbody');

    tbody.exit()
      .remove();

    var rows = tbody.selectAll('tr')
      .data(function (d) {
        return d;
      });

    rows.enter()
      .append('tr');

    rows.exit()
      .remove();

    var cells = rows.selectAll('td')
      .data(function (d) {
        return columns.map(function (column) {
          column.value = d[column.field];
          return column;
        });
      })
      .html(function (d) {
        return format(d, d.value);
      });

    cells.enter()
      .html(function (d) {
        return format(d, d.value);
      });

    cells.exit()
      .remove();
  };

  Tablamo.prototype.refreshColumns = function() {
    var table = this.drawTable();

    var columns = this.model.get('columns');

    var headings = table.select('thead tr').selectAll('th')
      .data(columns)
      .html(function (d) {
        return format(d, d.value);
      });

    headings.enter()
      .append('th')
      .html(function (d) {
        return format(d, d.value);
      });

    headings.exit()
      .remove();
  };

  Tablamo.prototype.refreshAll = function () {
    this.refreshColumns();
    this.refreshData();
  };

  Tablamo.prototype.refreshPivot = function () {
    var data = this.model.get('data');
    var pivot = this.model.get('pivot');

    var nestFn = d3.nest();

    pivot.forEach(function(column) {
      nestFn.key.call(this, function(d) {
        return d[column.field];
      });
    });

    return nestFn.entries.call(this, data);
  };

  Tablamo.prototype.refreshSort = function () {
    var data = this.model.get('data');
    var sort = this.model.get('sort');
    return _.sortBy(data, sort);
  };

  Tablamo.prototype.drawTable = function () {
    var element = this.element;
    var data = this.model.get('data');

    var table = d3.select(element).selectAll('table')
      .data([data]);

    table.enter()
      .append('div')
      .append('table');

    table.exit()
      .remove();

    var thead = table.selectAll('thead')
      .data(function (d) {
        return [d];
      });

    thead.enter()
      .append('thead')
      .append('tr');

    thead.exit()
      .remove();
      
    var tbody = table.selectAll('tbody')
      .data(function (d) {
        return [d];
      });

    tbody.enter()
      .append('tbody');

    tbody.exit()
      .remove();
    
    return table;
  };

  function format(model, value) {
    if (model.formatter) {
      return model.formatter(model, value);
    } else {
      return value;
    }
  }

  return Tablamo;
}));
