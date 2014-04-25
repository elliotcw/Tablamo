/* global define */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['d3', 'lodash'], factory);
  } else {
    root.Tablamo = root.Tablamo || {};
    root.Tablamo.DataModel = factory(root.d3, root._);
  }
}(this, function(d3, _) {
  'use strict';

  function TablamoData(everything) {

    this. listeners = {};

    var requiredAttributes = ['data', 'options', 'columns'];

    requiredAttributes.forEach(function (requiredAttribute) {
      var message = requiredAttribute + 'is undefined; it is a required attribute';
      console.assert(everything[requiredAttribute], message);
    });

    _.extend(this, everything);
  }

  TablamoData.prototype.get = function (attribute) {
    return this[attribute];
  };

  TablamoData.prototype.set = function (attribute, data) {
    this[attribute] = data;
    this.trigger('change:' + attribute, data);
  };

  TablamoData.prototype.trigger = function (eventName, eventData) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].forEach(this.listeners[eventName].bind(this, eventData));
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
      this.listeners[key].forEach(this.off.bind(this, key));
    });
    console.log(this.listeners);
  };



  return TablamoData;
}));
