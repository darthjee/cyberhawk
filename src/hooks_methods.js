(function(_, local) {
  local.HooksMethods = {
    on: function(path, event, func) {
      if (path.constructor == Array) {
        let klass = this;

        return _.each(path, function(route) {
          klass.on(route, event, func);
        });
      }

      if (!this.pathHooks[path]) {
        this.pathHooks[path] = {};
      }

      if (!this.pathHooks[path][event]) {
        this.pathHooks[path][event] = [];
      }

      this.pathHooks[path][event].push(func);
    },

    pathHooksFor: function(path, event) {
      if (!this.pathHooks[path]) {
        return [];
      }

      if (!this.pathHooks[path][event]) {
        return [];
      }

      return this.pathHooks[path][event];
    },

    trigger: function(controller, path, event) {
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
  }
}(_, local));
