(function(angular, global, local) {
  local.Cyberhawk = global.Cyberhawk = {};

  angular.module("cyberhawk", [
    "cyberhawk/requester", "cyberhawk/controller",
    "cyberhawk/config", "cyberhawk/builder"
  ]);
}(window.angular, window, local));
