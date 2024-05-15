(function(_, local) {
  local.HooksMethods = {
    on(path, event, func) {
      if (path.constructor == Array) {
        let klass = this;

        _.each(path, function(route) {
          klass.setPathHook(route, event, func);
        });
      } else {
        setPathHook(path, event, func);
      }
    },

    trigger(controller, path, event) {
      var hooks = this.getPathHooks(path, event);

      if ( hooks ) {
        _.each(hooks, function(func) {
          if (typeof func == "string") {
            controller[func]();
          } else {
            func.apply(controller);
          }
        });
      }
    },

    setPathHook(path, event, func) {
      hooks = getPathHooks(path, event);

      if (!hooks) {
        if ( !this.pathHooks[path] ){
          this.pathHooks[path] = {};
        }
        hooks = this.pathHooks[path][event] = [];
      }

      hooks.push(func);
    },

    getPathHooks(path, event) {
      if (!this.pathHooks) {
        this.pathHooks = {};
      }

      if (this.pathHooks[path]) {
        return this.pathHooks[path][event];
      }
    }
  };
}(window._, local));
