(function(_, angular, Cyberhawk) {
  var module = angular.module("cyberhawk/builder", [
    "cyberhawk/notifier", "cyberhawk/requester",
    "cyberhawk/pagination"
  ]),
    Controller = Cyberhawk.Controller;

  class ControllerBuilderService {
    constructor(requesterBuilder, notifier, $location, $timeout, pagination, route) {
      this.attributes = {
        requester: requesterBuilder.build($location),
        notifier: notifier,
        pagination: pagination,
        location: $location,
        $timeout: $timeout,
        routeParams: route.current.pathParams,
        route: route.current.$$route.route
      }
    }

    build(controller) {
      _.extend(controller, this.attributes);
      Controller.extend(controller.route, controller);
      _.bindAll(controller, "_setData", "save", "request", "_goIndex", "_error");
      controller.requester.bind(controller);

      _.extend(controller.constructor.prototype, Controller.prototype);

      controller.request();
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
}(window._, window.angular, window.Cyberhawk));
