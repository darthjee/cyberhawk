(function(_, angular, local) {
  var Cyberhawk = local.Cyberhawk,
    HooksMethods = local.HooksMethods,
    ExtensionMethods = local.ExtensionMethods,
    ControllerMethods = local.ControllerMethods;

  function Controller() {
    this.construct.apply(this, arguments);
  }

  var fn = Controller.prototype,
    app = angular.module("cyberhawk/controller", [
      "cyberhawk/notifier", "cyberhawk/requester",
      "cyberhawk/pagination"
    ]);

  _.extend(Controller, HooksMethods, ExtensionMethods);

  _.extend(fn, ControllerMethods);

  app.controller("Cyberhawk.Controller", [
    "cyberhawk_builder", function(builder) { builder.build(this); }
  ]);

  Cyberhawk.Controller = Controller;
}(window._, window.angular, local));
