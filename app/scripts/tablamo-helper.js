/* global define */
(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['lodash', 'd3'], factory);
  } else {
    root.ToblamoHelper = factory(root._, root.d3);
  }
}(this, function(_, d3) {
  'use strict';

  function TablamoHelper() {
  }

  TablamoHelper.prototype.pivotBy = function (data, pivotBy) {
    var nestFn = d3.nest();

    pivotBy.forEach(function(column) {
      nestFn.key.call(this, function(d) {
        return d[column.field];
      });
    });

    return nestFn.entries.call(this, data);
  };

  TablamoHelper.prototype.sortBy = function (data, sortBy) {
    var sort = _.pluck(sortBy, 'field');
    return _.sortBy(data, sort);
  };

  return TablamoHelper;
}));