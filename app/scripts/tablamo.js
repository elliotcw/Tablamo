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
    this.model.on('change:size', this.refresh.bind(this));
    this.model.on('change:scrollTop', this.refresh.bind(this));

    this.drawContainer();
    this.refresh();
    this.initBinding();
  }

  Tablamo.prototype.refresh = function () {    
    this.drawTable();
    this.drawColumns();
    this.drawRows();
    this.drawCells();
    this.syncColumns();
  };

  Tablamo.prototype.drawContainer = function () {
    var element = this.element;
    var rowHeight = this.model.get('rowHeight');
    var height = this.model.get('height');
    var data = this.model.get('data');

    d3.select(element).classed('tablamo-container', true)
      .style('height', function () {
        return height ? (height + 'px') : d3.select(this).style('height');
      })
      .append('div').classed('tablamo', true)
      .style('height', function () {
        return data.length * rowHeight + 'px';
      });
  };

  Tablamo.prototype.drawTable = function () {
    var element = this.element;

    var table = d3.select(element).select('.tablamo')
      .selectAll('table')
      .data([true, false]);

    table.enter()
      .append('table')
      .classed('sticky-header', function (d) {
        return d;
      })
      .classed('tablamo-main', function (d) {
        return !d;
      });

    table.exit()
      .remove();

    var thead = d3.select(element).selectAll('table').selectAll('thead')
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

    var headings = d3.select(element).selectAll('table thead tr').selectAll('th')
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
    var eagerLoad = this.model.get('eagerLoad');
    var rowHeight = this.model.get('rowHeight');
    var scrollTop = this.model.get('scrollTop');

    var rowOffset = Math.floor(scrollTop / rowHeight);
    rowOffset = isNaN(rowOffset) ? 0 : rowOffset;

    var data = this.model.limitTo(this.model.nest(this.model.get('sortBy')), {min: rowOffset - eagerLoad, max: rowOffset + eagerLoad});
    
    var table = d3.select(element).select('.tablamo-main')
      .style('top', function () {
        return (rowOffset * rowHeight) + 'px';
      });

    var tbodys = table.selectAll('tbody')
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

  Tablamo.prototype.syncColumns = function () {
    var element = this.element;

    setTimeout(function () {
      d3.select(element).selectAll('.tablamo-main th')
        .each(function (d, i) {
          d3.select(element)
            .select('.sticky-header th:nth-of-type(' + (i + 1) + ')')
            .style('width', d3.select(this).style('width'));
        });

      d3.select(element).select('.sticky-header')
        .classed('show', true);      
    }, 1);
  };

  Tablamo.prototype.initBinding = function () {    
    var element = this.element;
    var model = this.model;

    d3.select(element)
      .on('scroll', function () {        
        model.set('scrollTop', this.scrollTop);
      });
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
