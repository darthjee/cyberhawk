(function(_, angular, Cyberhawk) {
  function Controller(builder, notifier, $location, $timeout, pagination) {
    this.construct(builder.build($location), notifier, $location, $timeout, pagination);
  }

  var fn = Controller.prototype,
      app = angular.module("cyberhawk/controller", [
        "cyberhawk/notifier", "cyberhawk/requester",
        "cyberhawk/pagination"
      ]);

  fn.construct = function(requester, notifier, $location, $timeout, pagination, routeParams) {
    this.requester = requester;
    this.notifier = notifier;
    this.pagination = pagination;
    this.location = $location;
    this.$timeout = $timeout;
    this.route = routeParams;

    _.bindAll(this, "_setData", "save", "request", "_goIndex", "_error");
    this.requester.bind(this);
    this.request();
  };

  fn.request = function() {
    var promise = this.requester.request();
    promise.then(this._setData);
  };

  fn._setData = function(response) {
    this._setPagination(response);
    this.data = response.data;
    this.loaded = true;
  };

  fn._setPagination = function(response) {
    if (this.pagination) {
      this.pagination.parse(response);
    }
  };

  fn.save = function() {
    var promise = this.requester.saveRequest(this.payload());

    promise.then(this._setData);
    promise.then(this._goIndex);
    promise.error(this._error);
  };

  fn.payload = function() {
    return this.data;
  };

  fn._error = function(data, responseStatus) {
    if(responseStatus === 422) {
      this.data = data;
    }
  };

  fn._goIndex = function() {
    this.location.path(this.location.$$path.replace(/\/(edit|new)$/, ""));
  };

  fn.delete = function(id) {
    var promise = this.requester.deleteRequest(id);
    promise.then(this.request);
  };

  app.controller("Cyberhawk.Controller", [
    "cyberhawk_requester",
    "cyberhawk_notifier",
    "$location",
    "$timeout",
    "cyberhawk_pagination",
    "$routeParams",
    Controller
  ]);

  Cyberhawk.Controller = Controller;
}(window._, window.angular, window.Cyberhawk));
