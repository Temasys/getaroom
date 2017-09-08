/** @jsx React.DOM */

define([], function() {

  return {
    /**
     * Generates the unique Room name
     */
    uuid: function (l) {
      var i, random;
      var uuid = '';
      l = Math.max(Math.min(parseInt(l, 10), 32), 0);

      for (i = 0; i < l; i++) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
          uuid += '-';
        }
        uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
            .toString(16);
      }

      return uuid;
    },

    /**
     * Stores data in localStorage
     * Note, Not used as of now
     */
    store: function (namespace, data) {
      if (data) {
        return localStorage.setItem(namespace, JSON.stringify(data));
      }

      var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    },

    /**
     * Extends the object so the object does not require rewriting
     */
    extend: function () {
      var newObj = {};
      for (var i = 0; i < arguments.length; i++) {
        var obj = arguments[i];
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            newObj[key] = obj[key];
          }
        }
      }
      return newObj;
    },

    /**
     * Gets the list of object keys.
     */
    keys: function (object) {
      var keys = [];

      for (var property in object) {
        if (object.hasOwnProperty(property)) {
          keys.push(property);
        }
      }
      return keys;
    },

    /**
     * Loops an object.
     */
    forEach: function (object, fn) {
      if (Array.isArray(object)) {
        var index = 0;
  
        while (index < object.length) {
          fn(object[index], index);
          index++;
        }
      } else if (object && typeof object === 'object') {
        for (var prop in object) {
          if (object.hasOwnProperty(prop)) {
            fn(object[prop], prop);
          }
        }
      }
    }

  };
});
