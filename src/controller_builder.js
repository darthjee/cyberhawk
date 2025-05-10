(function(_, angular, local) {
  var HooksMethods = local.HooksMethods,
    ExtensionMethods = local.ExtensionMethods,
    ControllerMethods = local.ControllerMethods,

    module = angular.module("cyberhawk/builder", [
      "cyberhawk/notifier", "cyberhawk/requester",
      "cyberhawk/pagination"
    ]);

  class Builder {
    constructor(controller, attributes, options) {
      this.controller = controller;
      this.attributes = attributes;
      this.options    = options
    }

    build() {
      if (!this._isBuilt()) {
        this._addMethods();
        this._callback();
      }

      _.extend(this.controller, this.attributes);

      this._bind();
    }

    _callback() {
      if (this.options.callback) {
        this.options.callback.apply(this.controller.constructor);
      }
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
      this.controller.bindMethods();
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

    build(controller, options) {
      if (options == undefined) {
        options = {};
      } else if (options.constructor == Function) {
        options = {
          callback: options
        };
      }
      this.options = options;

      new Builder(controller, this.attributes(), options).build();
    }

    buildAndRequest(controller, options) {
      this.build(controller, options);

      controller.request();
    }

    attributes() {
      return {
        requesterBuilder: this.requesterBuilder,
        notifier: this.notifier,
        pagination: this.pagination,
        location: this.$location,
        $timeout: this.$timeout,
        routeParams: this.fetchAttribute("routeParams", function() {
          return this.route.current.pathParams;
        }),
        route: this.fetchAttribute("route", function() {
          return this.route.current.$$route.route;
        }),
        path: this.fetchAttribute("path", function() {
          return this.$location.$$path;
        }),
      };
    }

    fetchAttribute(name, def) {
      return this.options[name] || def.apply(this);
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
