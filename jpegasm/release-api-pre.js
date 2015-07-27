(function (root, factory) {
  if (typeof define === 'function' && define['amd']) {
    define([], factory());
  } else if (typeof exports === 'object') {
    module['exports'] = factory();
  } else {
    root['jpegasm'] = factory();
  }
}(typeof window !== 'undefined' ? window : this, function () {
  var API = {};
