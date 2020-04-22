//NOTIFIER
(function(_, angular, Cyberhawk) {
  var module = angular.module('cyberhawk/notifier', []);

  Cyberhawk.NotifierServiceFactory = function() {
    return new NotifierService();
  };

  function NotifierService() {
    this.watchs = {};
  }

  var fn = NotifierService.prototype;

  fn.notify = function(key, value) {
    _.each(this.listeners(key), function(callback) {
      callback(value);
    });
  };

  fn.register = function(key, callback) {
    this.listeners(key).push(callback);
  };

  fn.listeners = function(key) {
    if (this.watchs[key] === undefined) {
      this.watchs[key] = [];
    }
    return this.watchs[key];
  };

module.service('cyberhawk_notifier', [Cyberhawk.NotifierServiceFactory])
}(window._, window.angular, window.Cyberhawk));
