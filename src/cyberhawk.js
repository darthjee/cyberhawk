(function(angular, global) {
  global.Cyberhawk = {};

  angular.module("cyberhawk", [
    "cyberhawk/requester", "cyberhawk/controller"
  ]);
}(window.angular, window));
