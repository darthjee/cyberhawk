(function(angular, global) {
  global.Cyberhawk = {};

  angular.module("cyberhawk", [
    "cyberhawk/requester", "cyberhawk/controller",
    "cyberhawk/config"
  ]);
}(window.angular, window));
