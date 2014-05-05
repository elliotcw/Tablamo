/* global define */
(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['d3', 'lodash', 'tablamo-data'], factory);
  } else {
    root.Tablamo = factory(root.d3, root._, root.TablamoDataModel);
  }
}(this, function(d3, _, DataModel) {
  'use strict';

  function Tablamo(data, columns, options, element) {

    this.element = element || document.createElement('div');

    this.model = new DataModel(data, columns, options);

    this.model.on('change:data', this.refresh.bind(this));
    this.model.on('change:columns', this.refresh.bind(this));
    this.model.on('change:nestBy', this.refresh.bind(this));

    this.refresh();
  }

  Tablamo.prototype.drawTable = function () {
    var element = this.element;

    var table = d3.select(element).selectAll('table')
      .data([true, false]);

    table.enter()
      .append('table')
      .classed('tablamo-header', function (d) {
        return d;
      })
      .classed('tablamo-body', function (d) {
        return !d;
      });

    table.exit()
      .remove();

    var thead = d3.select(element).select('.tablamo-header').selectAll('thead')
      .data(function (d) {
        return [d];
      });

    thead.enter()
      .append('thead')
      .append('tr');

    thead.exit()
      .remove();
  };

  Tablamo.prototype.drawColumns = function() {
    var columns = this.model.get('columns');
    var element = this.element;

    var headings = d3.select(element).select('.tablamo-header thead tr').selectAll('th')
      .data(columns)
      .html(function (d) {
        return format(d, d.name || d.field);
      });

    headings.enter()
      .append('th')
      .html(function (d) {
        return format(d, d.name || d.field);
      });

    headings.exit()
      .remove();
  };

  Tablamo.prototype.drawRows = function () {
    var element = this.element;
    var data = this.model.limitTo(this.model.nest(this.model.get('sortBy')), {min: 0, max: 500});
    
    var tbodys = d3.select(element).select('.tablamo-body').selectAll('tbody')
      .data(data);

    tbodys.enter()
      .append('tbody');

    tbodys.exit()
      .remove();

    var rows = tbodys.selectAll('tr')
      .data(function (d) {
        return d.values;
      });

    rows.enter()
      .append('tr');

    rows.exit()
      .remove();
  };

  Tablamo.prototype.drawCells = function () {
    var element = this.element;
    var columns = this.model.get('columns');

    var cells = d3.select(element).selectAll('tbody > tr').selectAll('td')
      .data(function (d) {
        return columns.map(function (column) {
          return {
            value: d[column.field],
            column: column
          };
        });
      })
      .html(function (d) {
        return format(d, d.value);
      });

    cells.enter()
      .append('td')
      .html(function (d) {
        return format(d, d.value);
      });

    cells.exit()
      .remove();
  };

  Tablamo.prototype.refresh = function () {
    this.drawTable();
    this.drawColumns();
    this.drawRows();
    this.drawCells();
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
