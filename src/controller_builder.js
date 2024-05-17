(function(_, angular, local) {
  var HooksMethods = local.HooksMethods,
    ExtensionMethods = local.ExtensionMethods,
    ControllerMethods = local.ControllerMethods,

    module = angular.module("cyberhawk/builder", [
      "cyberhawk/notifier", "cyberhawk/requester",
      "cyberhawk/pagination"
    ]);

  class Builder {
    constructor(controller, attributes) {
      this.controller = controller;
      this.attributes = attributes;
    }

    build() {
      this._addMethods();

      _.extend(this.controller, this.attributes);

      this._bind();
    }

    _addMethods() {
      _.extend(this.controller.constructor.prototype, ControllerMethods);
      _.extend(this.controller.constructor, HooksMethods, ExtensionMethods);

      this.controller.constructor.extend(this.attributes.route, this.controller);
    }

    _bind() {
      _.bindAll(this.controller, "_setData", "save", "request", "_goIndex", "_error");
      this.controller.requester.bind(this.controller);
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
      new Builder(controller, this.attributes()).build();
      
      if (callback) {
        callback.apply(controller);
      }

      controller.request();
    }

    attributes() {
      return {
        requesterBuilder: this.requesterBuilder,
        requester: this.requesterBuilder.build(this.$location),
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
