(function(_, angular, local) {
  var HooksMethods = local.HooksMethods,
    ExtensionMethods = local.ExtensionMethods,
    ControllerMethods = local.ControllerMethods,

    module = angular.module("cyberhawk/builder", [
      "cyberhawk/notifier", "cyberhawk/requester",
      "cyberhawk/pagination"
    ]);

  class Builder {
    constructor(controller, attributes, callback) {
      this.controller = controller;
      this.attributes = attributes;
      this.callback   = callback;
    }

    build() {
      if (!this._isBuilt()) {
        this._addMethods();

        if (this.callback) {
          this.callback.apply(this.controller);
        }
      }

      _.extend(this.controller, this.attributes);

      this._bind();
    }

    _isBuilt() {
      var constructor = this.controller.constructor;

      return constructor.cyberhawk;
    }

    _addMethods() {
      var constructor = this.controller.constructor,
        prototype = _.extend(ControllerMethods, constructor.prototype),
        methods =  _.extend(HooksMethods, ExtensionMethods, constructor);;

      _.extend(constructor.prototype, prototype);
      _.extend(constructor, methods);

      constructor.extend(this.attributes.route, this.controller);
      constructor.cyberhawk = true;
    }

    _bind() {
      _.bindAll(this.controller, "_setData", "save", "request", "_goIndex", "_error");
    }
  }

  class ControllerBuilderService {
    constructor(requesterBuilder, notifier, $location, $timeout, pagination, route) {
      this.requesterBuilder = requesterBuilder;
      this.notifier = notifier;
      this.pagination = pagination;
      this.$location = $location;
      this.$timeout = $timeout;
      this.route = route;
    }

    build(controller, callback) {
      new Builder(controller, this.attributes(), callback).build();
    }

    buildAndRequest(controller, callback) {
      this.build(controller, callback);

      controller.request();
    }

    attributes() {
      return {
        requesterBuilder: this.requesterBuilder,
        notifier: this.notifier,
        pagination: this.pagination,
        location: this.$location,
        $timeout: this.$timeout,
        routeParams: this.route.current.pathParams,
        route: this.route.current.$$route.route
      };
    }
  }

  function ControllerBuilderServiceFactory(requesterBuilder, notifier, $location, $timeout, pagination, route) {
    return new ControllerBuilderService(requesterBuilder, notifier, $location, $timeout, pagination, route);
  }

  module.service("cyberhawk_builder", [
    "cyberhawk_requester",
    "cyberhawk_notifier",
    "$location",
    "$timeout",
    "cyberhawk_pagination",
    "$route",
    ControllerBuilderServiceFactory
  ]);
}(window._, window.angular, local));
