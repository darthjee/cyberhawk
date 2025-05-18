(function(_, angular) {
  var module = angular.module("cyberhawk/global_state", []);


  class GlobalStateService {
    constructor() {
      this.id = Math.floor(Math.random() * 1000000);
    }
  }

  function GlobalStateServiceFactory($http) {
    return new GlobalStateService($http);
  }

  module.service("global_state", [
    GlobalStateServiceFactory
  ]);
}(window._, window.angular));  
