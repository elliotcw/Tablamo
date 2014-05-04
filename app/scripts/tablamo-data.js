/* global define */
(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['lodash', 'd3'], factory);
  } else {
    root.TablamoDataModel = factory(root._, root.d3);
  }
}(this, function(_, d3) {
  'use strict';

  function TablamoData(data, columns, options) {
    this.listeners = {};
    this.underlying = {};

    _.extend(this.underlying, {data: data, columns: columns}, options);
  }

  TablamoData.prototype.get = function (attribute) {
    return this.underlying[attribute];
  };

  TablamoData.prototype.set = function (attribute, data) {
    this.underlying[attribute] = data;
    this.trigger('change:' + attribute, data);
  };

  TablamoData.prototype.nest = function (sortBy) {
    var last;
    var nestFn = d3.nest();

    if (sortBy.length > 1) {
      last = sortBy.pop();
    }

    sortBy.forEach(function(sortDef) {
      nestFn = nestFn.key.call(this, function(d) {
        return d[sortDef.field];
      });

      if (sortDef.direction) {
        nestFn = nestFn.sortKeys.call(this, function (a, b) {
          var aa = parseFloat(a);
          var bb = parseFloat(b);
          
          a = (isNaN(aa)) ? a : aa;
          b = (isNaN(bb)) ? b : bb;

          return d3[sortDef.direction].call(this, a, b);
        });
      }
    });

    if (last) {
      nestFn = nestFn.sortValues(function (a, b) {
        return d3[last.direction].call(this, a[last.field], b[last.field]);
      });
    }

    return nestFn.entries.call(this, this.get('data'));
  };

  TablamoData.prototype.trigger = function (eventName, eventData) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].forEach(function (cb) {
      cb.call(this, eventData);
    }.bind(this));
  };

  TablamoData.prototype.on = function (eventName, callback) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(callback);
  };

  TablamoData.prototype.off = function (eventName, callback) {
    var index = this.listeners[eventName].indexOf(callback);
    this.listeners[eventName].slice(index, -1);
  };

  TablamoData.prototype.destroy = function () {
    console.log(this.listeners);
    Object.keys(this.listeners).forEach(function (key) {
      this.listeners[key].forEach(function (cb) {
        this.off.call(this, cb, key);
      });
    }.bind(this));
    console.log(this.listeners);
  };

  return TablamoData;
}));
