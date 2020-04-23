// CONTROLLER
(function(_, angular, Cyberhawk) {
  function Controller(builder, notifier, $location) {
    this.construct(builder.build($location), notifier, $location);
  }

  var fn = Controller.prototype,
      app = angular.module("cyberhawk/controller", [
        "cyberhawk/notifier", "cyberhawk/requester"
      ]);

  fn.construct = function(requester, notifier, $location) {
    this.requester = requester;
    this.notifier = notifier;
    this.location = $location;

    _.bindAll(this, "_setData", "save", "request", "_goIndex", "_error");
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
    var promise = this.requester.saveRequest(this.data);
    promise.then(this._setData);
    promise.then(this._goIndex);
    promise.error(this._error);
  };

  fn._error = function(data, responseStatus) {
    if(responseStatus === 422) {
      this.data = data;
    }
  };

  fn._goIndex = function() {
    this.location.path(this.location.$$path.replace(/(\w*\/edit|new)/, ""));
  };

  fn.delete = function(id) {
    promise = this.requester.deleteRequest(id);
    promise.then(this.request);
  }

  app.controller("Cyberhawk.Controller", [
    "cyberhawk_requester", "cyberhawk_notifier", "$location",
    Controller
  ]);

  Cyberhawk.Controller = Controller;
}(window._, window.angular, window.Cyberhawk));
