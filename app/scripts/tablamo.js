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
  var totalRows;
  var expandedGroups = {};

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
    this.refreshTable();

    var that = this;

    this._element.select('.tablamo-viewport').on('scroll', _.debounce(function() {
      that.scrollTop = this.scrollTop;
      that.refreshTable();
    }, 100));
  }

  Tablamo.prototype.refreshTable = function () {
    var filterOptions = {
      scrollTop: this.scrollTop,
      rowHeight: rowHeight,
      offset: offset,
      visibleRows: visibleRows
    };

    var nest = this.groupBy(this._data, [{
      field: 'colour'
    }, {
      field: 'weather'
    }]);
    var subset = this.filterToVisibleRows(this._columns, nest, filterOptions);
    this.bindDataToTableBody(this._element, this._columns, subset);
  };


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

  function groupFormatter(value, d) {
    var icon = (d.expanded) ? 'fa-caret-down' : 'fa-caret-right';
    return '<i class="fa ' + icon + '"></i>' + value;
  }

  Tablamo.prototype.bindDataToTableBody = function(element, columns, data) {

    var that = this;

    console.log(data);

    this._element.select('.tablamo-thing').style('height', (totalRows * rowHeight) + 'px');

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

    this._body.style('top', (data[0][0].rowIndex * rowHeight) + 'px');

    var groups = this._body.selectAll('tbody')
      .data(data)
      .attr('gorup-name', function(d) {
        return d[0].groupName;
      })
      .attr('level', function (d) {
        if (d[0] instanceof SummaryRow) {
          return d[0].level;
        }
      })
      .classed('expanded', function (d) {
        return (d[0] instanceof SummaryRow && d[0].expanded);
      });

    groups.enter()
      .append('tbody')
      .attr('gorup-name', function(d) {
        return d[0].groupName;
      })
      .attr('level', function (d) {
        if (d[0] instanceof SummaryRow) {
          return d[0].level;
        }
      })
      .classed('expanded', function (d) {
        return (d[0] instanceof SummaryRow && d[0].expanded);
      });

    groups.exit()
      .remove();

    var rows = groups.selectAll('tr')
      .data(function (d) {
        return d;
      })
      .classed('group-header', function (d) {
        return (d instanceof SummaryRow);
      })
      .attr('row-index', function(d) {
        return d.rowIndex;
      });

    rows.enter()
      .append('tr')
      .classed('group-header', function (d) {
        return (d instanceof SummaryRow);
      })
      .classed('expanded', function (d) {
        return (d instanceof SummaryRow && d.expanded);
      })
      .attr('row-index', function(d) {
        return d.rowIndex;
      });

    rows.exit()
      .remove();

    var cells = rows.selectAll('td')
      .data(function(d) {
        if (d instanceof SummaryRow) {
          return columns.map(function (column, i) {
            if (i === 0) {
              d.formatter = groupFormatter;
              d.value = d.groupName;
              return d;
            } else {
              return {value: ''};
            }
            return {
              value: d[column.field],
              formatter: column.formatter
            };
          });
        } else {
          return columns.map(function (column) {
            return {
              value: d[column.field],
              formatter: column.formatter
            };
          });
        }
      })
      .html(function(d) {
        var value = (d.formatter) ? d.formatter(d.value, d) : d.value;
        return value;
      });

    cells.enter()
      .append('td')
      .html(function(d) {
        var value = (d.formatter) ? d.formatter(d.value, d) : d.value;
        return value;
      });

    cells.exit()
      .remove();

    groups.selectAll('.group-header')
      .on('click', function (d) {
        d.expanded = !d.expanded;
        expandedGroups[d.groupName] = d.expanded;

        that.refreshTable();
      });
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

  function SummaryRow(row) {
    _.extend(this, row);
  }

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

    totalRows = -1;

    function addRow(row) {
      totalRows++;

      // TODO: looping over each element - this should be a straight pick
      if (totalRows > minRow && (filteredData.length + 1) < maxRow) {
        row.rowIndex = totalRows;
        filteredData.push(row);
      }
    }

    function addToFiltered(group, level) {
      level++;

      group.values.forEach(function(rowOrGroup) {
        // TODO: need to do this on type
        if (rowOrGroup.key && rowOrGroup.values) {
          // Another group
          // Add a summary row          
          addRow(new SummaryRow({
            groupName: rowOrGroup.key,
            expanded: expandedGroups[rowOrGroup.key],
            level: level
          }));

          if (expandedGroups[rowOrGroup.key]) {
            // If its expanded we need to include its children
            addToFiltered(rowOrGroup, level);
          }
        } else {
          // We got a row
          addRow(rowOrGroup);
        }
      });
    }

    addToFiltered({values: data}, -1);

    var groups = [];
    var currentGroup = [];

    filteredData.forEach(function (row) {
      if (row instanceof SummaryRow) {
        if (currentGroup.length) {
          groups.push(currentGroup);
        }
        currentGroup = [];
        currentGroup.push(row);
      } else {
        currentGroup.push(row);
      }
    });

    // Need to push the last group in
    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
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
