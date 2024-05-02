(function(_, angular, Cyberhawk) {
  var module = angular.module("cyberhawk/builder", [
    "cyberhawk/notifier", "cyberhawk/requester",
    "cyberhawk/pagination"
  ]),
    Controller = Cyberhawk.Controller;

  class ControllerBuilderService {
    constructor(requesterBuilder, notifier, $location, $timeout, pagination, route) {
      this.requesterBuilder = requesterBuilder;
      this.notifier = notifier;
      this.pagination = pagination;
      this.$location = $location;
      this.$timeout = $timeout;
      this.route = route;
    }

    build(controller) {
      _.extend(controller.constructor.prototype, Controller.prototype);

      _.extend(controller, this.attributes());
      Controller.extend(controller.route, controller);
      _.bindAll(controller, "_setData", "save", "request", "_goIndex", "_error");
      controller.requester.bind(controller);


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
}(window._, window.angular, window.Cyberhawk));
