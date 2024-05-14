(function(_, angular, Cyberhawk) {
  var module = angular.module("cyberhawk/notifier", []);

  class NotifierService {
    constructor() {
      this.watchs = {};
    }

    notify(key, value) {
      _.each(this.listeners(key), function(callback) {
        callback(value);
      });
    }

    register(key, callback) {
      this.listeners(key).push(callback);
    }

    listeners(key) {
      if (typeof this.watchs[key] === "undefined") {
        this.watchs[key] = [];
      }
      return this.watchs[key];
    }
  }

  Cyberhawk.NotifierServiceFactory = function() {
    return new NotifierService();
  };

  module.service("cyberhawk_notifier", [Cyberhawk.NotifierServiceFactory]);
}(_, angular, local.Cyberhawk));
