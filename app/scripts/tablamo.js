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

  function Tablamo(element, columns, data, options) {
    visibleRows = options.visibleRows;
    offset = options.offset;
    rowHeight = options.rowHeight;

    this._element = element;
    this._columns = columns;
    this._data = data.map(function(row, i) {
      row.rowIndex = i;
      return row;
    });

    this.createTable(element);
    this.bindDataToTableHeader(element, columns);

    var filterOptions = {
      scrollTop: this.scrollTop,
      rowHeight: rowHeight,
      offset: offset,
      visibleRows: visibleRows
    };

    this.bindDataToTableBody(this._element, this._columns, this.filterToVisibleRows(this._columns, this._data, filterOptions));

    var self = this;

    this._element.select('.tablamo-viewport').on('scroll', _.debounce(function() {
      var filterOptions = {
        scrollTop: this.scrollTop,
        rowHeight: rowHeight,
        offset: offset,
        visibleRows: visibleRows
      };

      var nest = self.groupBy(self._data, [{
        field: 'colour'
      }, {
        field: 'weather'
      }]);
      var subset = self.filterToVisibleRows(self._columns, nest, filterOptions);
      self.bindDataToTableBody(self._element, self._columns, subset);
    }, 100));
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

    colgroup.style('width', function(d) {
      var width = (d.width) ? d.width + 'px' : (1 / columns.length) * 100 + '%';
      return width;
    });

    colgroup.enter()
      .append('col')
      .style('width', function(d) {
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
      return d.name || d.field;
    });

    columnHeaders.enter()
      .append('th')
      .classed('tablamo-cell', true)
      .html(function(d) {
        return d.name || d.field;
      });

    columnHeaders.exit()
      .remove();
  };

  Tablamo.prototype.bindDataToTableBody = function(element, columns, data) {

    console.log(data);

    this._element.select('.tablamo-thing').style('height', (this._data.length * rowHeight) + 'px');

    var colgroup = this._body
      .select('colgroup')
      .selectAll('col')
      .data(columns);

    colgroup.style('width', function(d) {
      var width = (d.width) ? d.width + 'px' : (1 / columns.length) * 100 + '%';
      return width;
    });

    colgroup.enter()
      .append('col')
      .style('width', function(d) {
        var width = (d.width) ? d.width + 'px' : (1 / columns.length) * 100 + '%';
        return width;
      });

    this._body.style('top', (data[0].key * rowHeight) + 'px');

    var rows = this._body.select('tbody')
      .selectAll('tr')
      .data(data)
      .attr('row-index', function(d) {
        return d.key;
      });

    rows.enter()
      .append('tr')
      .classed('tablamo-row', true)
      .style('height', rowHeight + 'px')
      .attr('row-index', function(d) {
        return d.key;
      });

    rows.exit()
      .remove();

    var cells = rows.selectAll('td').data(function(d) {
      return d.values;
    }).html(function(d) {
      return d;
    });

    cells.enter()
      .append('td')
      .classed('tablamo-cell', true)
      .html(function(d) {
        return d;
      });

    cells.exit()
      .remove();
  };

  Tablamo.prototype.groupBy = function(data, groupByColumns) {
    var nestFn = d3.nest();

    groupByColumns.forEach(function(column) {
      nestFn.key.call(this, function(d) {
        return d[column.field];
      });
    });

    return nestFn.entries.call(this, data);
  };

  Tablamo.prototype.filterToVisibleRows = function(columns, data, options) {
    options.scrollTop = options.scrollTop || 0;

    var filteredData = [];

    var topRow = options.scrollTop / options.rowHeight;
    var bottomRow = topRow + options.visibleRows;

    var minRow = Math.floor(topRow - options.offset);
    var maxRow = Math.ceil(bottomRow + options.offset);

    // Make sure first row is even to keep
    // stripes in sync
    minRow = (minRow % 2) ? minRow - 1 : minRow;

    function addRow(row) {
      // TODO: looping over each element - this should be a straight pick
      if ((filteredData.length + 1) > minRow && (filteredData.length + 1) < maxRow) {
        filteredData.push(row);
      }
    }

    function SummaryRow(row) {
      this.groupName = row.groupName;
      this.expanded = row.expanded;
    }

    function addToFiltered(group) {
      group.values.forEach(function(rowOrGroup) {
        // TODO: need to do this on type
        if (rowOrGroup.key && rowOrGroup.values) {
          // Another group
          // Add a summary row          
          addRow(new SummaryRow({
            groupName: rowOrGroup.key,
            expanded: rowOrGroup.expanded
          }));

          if (rowOrGroup.expanded) {
            // If its expanded we need to include its children
            addToFiltered(rowOrGroup);
          }
        } else {
          // We got a row
          addRow(rowOrGroup);
        }
      });
    }

    addToFiltered({values: data});

    console.log(filteredData);

    filteredData = filteredData.map(function(row) {
      return {
        key: row.rowIndex,
        values: columns.map(function(column) {
          return row[column.field];
        })
      };
    });

    return filteredData;
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
