// CYBERHAWK
(function(angular, global) {
  global.Cyberhawk = {};

  angular.module('cyberhawk', [
    'cyberhawk/requester', 'cyberhawk/controller'
  ])
}(window.angular, window));

// CONTROLLER
(function(_, angular, Cyberhawk) {
  function Controller(builder, notifier, $location) {
    this.construct(builder.build($location), notifier, $location);
  }

  var fn = Controller.prototype,
      app = angular.module('cyberhawk/controller', [
        'cyberhawk/notifier', 'cyberhawk/requester'
      ]);

  fn.construct = function(requester, notifier, $location) {
    this.requester = requester;
    this.notifier = notifier;
    this.location = $location;

    _.bindAll(this, '_setData', 'save', 'request', '_goIndex');
    this.request();
  };

  fn.request = function() {
    promise = this.requester.request();
    promise.then(this._setData);
  };

  fn._setData = function(response) {
    this.data = response.data;
    this.loaded = true;
  }

  fn.save = function() {
    promise = this.requester.saveRequest(this.data);
    promise.then(this._setData);
    promise.then(this._goIndex);
  };

  fn._goIndex = function() {
    this.location.path(this.location.$$path.replace(/(\w*\/edit|new)/, ''));
  };

  fn.delete = function(id) {
    promise = this.requester.deleteRequest(id);
    promise.then(this.request);
  }

  app.controller('Cyberhawk.Controller', [
    'cyberhawk_requester', 'cyberhawk_notifier', '$location',
    Controller
  ]);

  Cyberhawk.Controller = Controller;
}(window._, window.angular, window.Cyberhawk));

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

//REQUESTER
(function(_, angular) {
  function RequesterServiceFactory($http) {
    return new RequesterServiceBuilder($http);
  }

  function RequesterServiceBuilder($http) {
    this.http = $http;
  }

  RequesterServiceBuilder.prototype.build = function($location) {
    var path = $location.$$path + '.json';
    var savePath = $location.$$path.replace(/\/(new|edit)$/, '') + '.json';
    return new RequesterService(path, savePath, this.http);
  };

  function RequesterService(path, savePath, $http) {
    this.path = path;
    this.savePath = savePath;
    this.http = $http;
    _.bind(this.request, this);
  }

  var fn = RequesterService.prototype,
      module = angular.module('cyberhawk/requester', []);

  fn.request = function(callback) {
    return this.http.get(this.path);
  };

  fn.saveRequest = function(data) {
    if (this.path.match(/new.json$/)) {
      return this.http.post(this.savePath, data);
    } else {
      return this.http.patch(this.savePath, data);
    }
  };

  fn.deleteRequest = function(id) {
    return this.http.delete(this.path.replace(/(\.json)?$/, '/' + id + '.json'));
  };

  Cyberhawk.RequesterService = RequesterService;

  module.service('cyberhawk_requester', [
    '$http',
    RequesterServiceFactory
  ]);
})(window._, window.angular, Cyberhawk);
