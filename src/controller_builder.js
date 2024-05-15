(function(_, angular, local) {
  var Controller = local.Cyberhawk.Controller,
    HooksMethods = local.HooksMethods,
    ExtensionMethods = local.ExtensionMethods,
    ControllerMethods = local.ControllerMethods,

    module = angular.module("cyberhawk/builder", [
      "cyberhawk/notifier", "cyberhawk/requester",
      "cyberhawk/pagination"
    ]);

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
      _.extend(controller.constructor.prototype, ControllerMethods);
      _.extend(controller.constructor, HooksMethods, ExtensionMethods);

      _.extend(controller, this.attributes());
      Controller.extend(controller.route, controller);
      _.bindAll(controller, "_setData", "save", "request", "_goIndex", "_error");
      controller.requester.bind(controller);
      
      if (callback) {
        callback.apply(controller);
      }

      controller.request();
    }

    attributes() {
      return {
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
