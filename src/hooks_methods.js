(function(_, local) {
  local.HooksMethods = {
    on(path, event, func) {
      if (path.constructor == Array) {
        let klass = this;

        return _.each(path, function(route) {
          klass.on(route, event, func);
        });
      }

      if (!this.pathHooks[path]) {
        this.pathHooks[path] = {};
      }

      if (!this.getPathHooks(path, event)) {
        this.getPathHooks(path, event) = [];
      }

      this.getPathHooks(path, event).push(func);
    },

    pathHooksFor(path, event) {
      if (!this.pathHooks[path]) {
        return [];
      }

      if (!this.getPathHooks(path, event)) {
        return [];
      }

      return this.getPathHooks(path, event);
    },

    trigger(controller, path, event) {
      var hooks = this.pathHooksFor(path, event);

      _.each(hooks, function(func) {
        if (typeof func == "string") {
          controller[func]();
        } else {
          func.apply(controller);
        }
      });
    },

    pathHooks: {}
  };
}(window._, local));
