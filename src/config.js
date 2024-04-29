(function(_, angular, Cyberhawk) {
  class Config {
    constructor() {
      this.controller = Cyberhawk.Controller;
    }

    buildController(app, name) {
      var config = this;

      function NewController(builder, notifier, $location, $timeout, pagination, route) {
        config.construct(builder, notifier, $location, $timeout, pagination, route);
      };

      var fn = NewController.prototype;

      _.extend(fn, this.prototype);

      app.controller(name, [
        "cyberhawk_requester", "cyberhawk_notifier", "$location",
        "$timeout",
        "cyberhawk_pagination",
        "$route",
        NewController
      ]);

      return NewController;
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
