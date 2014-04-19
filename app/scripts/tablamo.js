/* global define */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['d3', 'underscore'], factory);
  } else {
    root.Tablamo = factory(root.d3, root._);
  }
}(this, function(d3, _) {
  'use strict';

  var visibleRows = 15;
  var offset = 100;
  var rowHeight = 26;

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
      this.bindDataToTableBody(this._element, e.data.rows);
    }.bind(this), false);

    var self = this;

    this._body.on('scroll', _.debounce(function() {
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
      .append('div')
      .classed('tablamo-header', true);

    this._body = this._element
      .append('div')
      .classed('tablamo-body', true);

    this._viewport = this._body
      .append('div')
      .classed('tablamo-viewport', true);
  };

  Tablamo.prototype.bindDataToTableHeader = function(element, columns) {
    var columnHeaders = this._header
      .append('div')
      .classed('tablamo-row', true)
      .classed('tablamo-header-row', true)
      .selectAll('div')
      .data(columns);

    columnHeaders.html(function(d) {
      return d.field;
    });

    columnHeaders.enter()
      .append('div')
      .classed('tablamo-cell', true)
      .html(function(d) {
        return d.field;
      });

    columnHeaders.exit()
      .remove();
  };

  Tablamo.prototype.bindDataToTableBody = function(element, data) {

    this._viewport.style({
      height: this._data.length * rowHeight + 'px'
    });

    var rows = this._viewport
      .selectAll('.tablamo-row')
      .data(data)
      .style('top', function(d) {
        return (rowHeight * d.key) + 'px';
      })
      .attr('row-index', function (d) {
        console.log('row update: ', d.key);
        return d.key;
      });

    rows.enter()
      .append('div')
      .classed('tablamo-row', true)
      .style('top', function(d) {
        return (rowHeight * d.key) + 'px';
      })
      .attr('row-index', function (d) {
        console.log('row enter: ', d.key);
        return d.key;
      });

    rows.exit()
      .remove();

    console.log(rows, rows.selectAll('div'));

    var cells = rows.selectAll('.tablamo-cell').data(function (d) {
      return d.values;
    }).html(function (d) {
      return d;
    });

    cells.enter()
      .append('div')
      .classed('tablamo-cell', true)
      .html(function (d) {
        console.log(d);
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
    this.bindDataToTableBody(this._element, data);
  };

  return Tablamo;
}));
