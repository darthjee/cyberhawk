(function(_, local) {
  local.HooksMethods = {
    on(path, event, func) {
      if (path.constructor == Array) {
        let klass = this;

        _.each(path, function(route) {
          klass._setathHooks(route, event, func);
        });
      } else {
        _setathHooks(path, event, func);
      }
    },

    trigger(controller, path, event) {
      var hooks = this._getPathHooks(path, event);

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

    _setPathHooks(path, event, func) {
      var hooks = _getPathHooks(path, event);

      if (!hooks) {
        if ( !this.pathHooks[path] ){
          this.pathHooks[path] = {};
        }
        hooks = this.pathHooks[path][event] = [];
      }

      hooks.push(func);
    },

    _getPathHooks(path, event) {
      if (!this.pathHooks) {
        this.pathHooks = {};
      }

      if (this.pathHooks[path]) {
        return this.pathHooks[path][event];
      }
    }
  };
}(window._, local));
