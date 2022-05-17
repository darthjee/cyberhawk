(function(_, angular, Cyberhawk) {
  class Config {
    constructor() {
      this.controller = Cyberhawk.Controller;
    }
  }

  // Old prototype style, can't get rid of it :(
  function CyberhawkProvider() {
    _.bindAll(this, '$get');
  };

  var module = angular.module('cyberhawk/config', []),
    fn = CyberhawkProvider.prototype;

  fn.$get = function() {
    return this.config || this._build();
  };

  fn._build = function() {
    return this.config = new Config();
  };

  module.provider('cyberhawk', CyberhawkProvider);
}(window._, window.angular, window.Cyberhawk));
