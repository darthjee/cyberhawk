(function(_, angular) {
  var module = angular.module("cyberhawk", []);


  class GlobalStateService {
    constructor() {
      this.id = Math.floor(Math.random() * 1000000);
    }
  }

  function GlobalStateServiceFactory($http) {
    return new GlobalStateService($http);
  }

  module.service("cyberhawk_global_state", [
    GlobalStateServiceFactory
  ]);
}(window._, window.angular));  
