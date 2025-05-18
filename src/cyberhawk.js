(function(angular, global, local) {
  local.Cyberhawk = global.Cyberhawk = {};

  angular.module("cyberhawk", [
    "cyberhawk/requester", "cyberhawk/controller",
    "cyberhawk/config", "cyberhawk/builder",
    "cyberhawk/global_state"
  ]);
}(window.angular, window, local));
