(function(_, angular, Cyberhawk, HooksMethods, ExtensionMethods) {
  function Controller() {
    this.construct.apply(this, arguments);
  }

  var fn = Controller.prototype,
    app = angular.module("cyberhawk/controller", [
      "cyberhawk/notifier", "cyberhawk/requester",
      "cyberhawk/pagination"
    ]);

  _.extend(Controller, HooksMethods, ExtensionMethods);

  _.extend(fn, {
    construct: function(requesterBuilder, notifier, $location, $timeout, pagination, route) {
      this.requester = requesterBuilder.build($location);
      this.notifier = notifier;
      this.pagination = pagination;
      this.location = $location;
      this.$timeout = $timeout;
      this.routeParams = route.current.pathParams;
      this.route = route.current.$$route.route

      Controller.extend(this.route, this);
      _.bindAll(this, "_setData", "save", "request", "_goIndex", "_error");
      this.requester.bind(this);
      this.request();
    },

    request: function() {
      var promise = this.requester.request();
      promise.then(this._setData);

      Controller.trigger(this, this.route, 'request');
    },

    _setData: function(response) {
      this._setPagination(response);
      this.data = response.data;
      this.loaded = true;
      Controller.trigger(this, this.route, 'loaded');
    },

    _setPagination: function(response) {
      if (this.pagination) {
        this.pagination.parse(response);
      }
    },

    save: function() {
      var promise = this.requester.saveRequest(this.payload());

      promise.then(this._setData);
      promise.then(this._goIndex);
      promise.error(this._error);
    },

    payload: function() {
      return this.data;
    },

    _error: function(data, responseStatus) {
      if(responseStatus === 422) {
        this.data = data;
      }
    },

    _goIndex: function() {
      this.location.path(this.location.$$path.replace(/\/(edit|new)$/, ""));
    },

    delete: function(id) {
      var promise = this.requester.deleteRequest(id);
      promise.then(this.request);
    }
  });

  app.controller("Cyberhawk.Controller", [
    "cyberhawk_builder", function(builder) { builder.build(this); }
  ]);

  Cyberhawk.Controller = Controller;
}(_, angular, local.Cyberhawk, local.HooksMethods, local.ExtensionMethods));
