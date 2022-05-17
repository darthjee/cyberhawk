(function(_, angular) {
  var module = angular.module("binded_http", []);

  class Controller {}

  _.extend(Controller.prototype,{
    initRequest(promisse) {
      if (!this.requests) {
        this.requests = [];
      }

      this.requests.push(promisse);

      this.finishRequest();
    },
    finishRequest() {
      this.requests = _.select(this.requests, function(promisse) {
        return promisse.$$state.status == 0
      });

      if (this.requests.length == 0) {
        this.ongoing = false;
      }
    }
  });

  class BindedHttpService {
    constructor($http) {
      this.http = $http;
      this.controller = new Controller();
    }

    bind(controller) {
      for (var method in Controller.prototype) {
        if (! controller[method]) {
          var bindedMethod = _.bind(Controller.prototype[method], controller);
          controller[method] = bindedMethod;
        }
      }

      this.controller = controller;
      return this;
    }
  }

  _.delegate(
    BindedHttpService, "http", "get", "post", "patch", "delete"
  );

  function watch(original) {
    var promisse = original();

    this.controller.initRequest(promisse);

    promisse.finally(this.controller.finishRequest)
    return promisse;
  }

  var middleware = {
    post: watch,
    get: watch,
    delete: watch
  };

  _.wrapFunctions(
    BindedHttpService.prototype, middleware, true
  );

  function BindedHttpServiceFactory($http) {
    return new BindedHttpService($http);
  }

  module.service("binded_http", [
    "$http",
    BindedHttpServiceFactory
  ]);
}(window._, window.angular));
