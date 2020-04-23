(function(_, angular) {
  var module = angular.module("binded_http", []);

  class Controller {
    initRequest() {
      console.info('request');
    }
    finishRequest() {
      console.info('end of request');
    }
  }

  class BindedHttpService {
    constructor($http) {
      this.http = $http;
      this.controller = new Controller();
    }

    bind(controller) {
      this.controller = controller;
      return this;
    }
  }

  _.delegate(
    BindedHttpService, "http", "get", "post", "delete"
  );


  function watch(original) {
    this.controller.initRequest();
    var promisse = original();

    promisse.finally(this.controller.finishRequest);
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
