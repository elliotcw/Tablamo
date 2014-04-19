/* global define */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['d3', 'underscore'], factory);
  } else {
    root.Tablamo = factory(root.d3, root._);
  }
}(this, function(d3, _) {
  'use strict';

  var visibleRows = 25;
  var offset = 100;
  var rowHeight = 36;

  function Tablamo(element, columns, data) {
    this._element = element;
    this._columns = columns;
    this._data = data.map(function(row, i) {
      row.rowIndex = i;
      return row;
    });

    this.createTable(element);
    this.bindDataToTableHeader(element, columns);

    var worker = new Worker('scripts/filter-worker.js');

    worker.addEventListener('message', function(e) {
      this.bindDataToTableBody(this._element, this._columns, e.data.rows);
    }.bind(this), false);

    var self = this;

    this._element.select('.tablamo-viewport').on('scroll', _.debounce(function() {
      worker.postMessage({
        columns: self._columns,
        rows: self._data,
        options: {
          scrollTop: this.scrollTop,
          rowHeight: rowHeight,
          offset: offset,
          visibleRows: visibleRows
        }
      });
    }, 100));

    worker.postMessage({
      columns: this._columns,
      rows: this._data,
      options: {
        scrollTop: this.scrollTop,
        rowHeight: rowHeight,
        offset: offset,
        visibleRows: visibleRows
      }
    });
  }

  Tablamo.prototype.createTable = function(element) {
    this._element = d3.select(element).classed('tablamo-container', true);

    this._header = this._element
      .append('table')
      .classed('tablamo-header', true);

    this._header.append('colgroup');
    this._header.append('thead');

    this._body = this._element
      .append('div')
      .classed('tablamo-viewport', true)
      .append('div')
      .classed('tablamo-thing', true)
      .append('table')
      .classed('tablamo-body', true);

    this._body.append('colgroup');
    this._body.append('tbody');

  };

  Tablamo.prototype.bindDataToTableHeader = function(element, columns) {
    var colgroup = this._header
      .select('colgroup')
      .selectAll('col')
      .data(columns);

    colgroup.style('width', function (d) {
      var width = (d.width) ? d.width + 'px' : (1 / columns.length) * 100 + '%';
      return width;
    });

    colgroup.enter()
      .append('col')
      .style('width', function (d) {
      var width = (d.width) ? d.width + 'px' : (1 / columns.length) * 100 + '%';
      return width;
    });

    colgroup.exit()
      .remove();

    var columnHeaders = this._header
      .select('thead')
      .append('tr')
      .classed('tablamo-row', true)
      .classed('tablamo-header-row', true)
      .selectAll('th')
      .data(columns);

    columnHeaders.html(function(d) {
      return d.field;
    });

    columnHeaders.enter()
      .append('th')
      .classed('tablamo-cell', true)
      .html(function(d) {
        return d.field;
      });

    columnHeaders.exit()
      .remove();
  };

  Tablamo.prototype.bindDataToTableBody = function(element, columns, data) {

    this._element.select('.tablamo-thing').style('height', (this._data.length * rowHeight) + 'px');

    var colgroup = this._body
      .select('colgroup')
      .selectAll('col')
      .data(columns);

    colgroup.style('width', function (d) {
      var width = (d.width) ? d.width + 'px' : (1 / columns.length) * 100 + '%';
      return width;
    });

    colgroup.enter()
      .append('col')
      .style('width', function (d) {
      var width = (d.width) ? d.width + 'px' : (1 / columns.length) * 100 + '%';
      return width;
    });

    this._body.style('top', (data[0].key * rowHeight) + 'px');

    var rows = this._body.select('tbody')
      .selectAll('tr')
      .data(data)
      .attr('row-index', function (d) {
        return d.key;
      });

    rows.enter()
      .append('tr')
      .classed('tablamo-row', true)
      .style('height', rowHeight + 'px')
      .attr('row-index', function (d) {
        return d.key;
      });

    rows.exit()
      .remove();

    var cells = rows.selectAll('td').data(function (d) {
      return d.values;
    }).html(function (d) {
      return d;
    });

    cells.enter()
      .append('td')
      .classed('tablamo-cell', true)
      .html(function (d) {
        return d;
      });

    cells.exit()
      .remove();
  };

  Tablamo.prototype.setColumns = function(columns) {
    this._columns = columns;
    this.bindDataToTableHeader(this._element, columns);
  };

  Tablamo.prototype.setData = function(data) {
    this._data = data;
    this.bindDataToTableBody(this._element, this._columns, data);
  };

  return Tablamo;
}));
