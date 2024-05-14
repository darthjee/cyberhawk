(function(_, angular, Cyberhawk, HooksMethods, ExtensionMethods, ControllerMethods) {
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
}(_, angular, local.Cyberhawk, local.HooksMethods, local.ExtensionMethods, local.ControllerMethods));
