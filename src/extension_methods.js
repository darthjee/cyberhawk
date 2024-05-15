(function(_, local) {
  local.ExtensionMethods = {
    withPath(path, name, func) {
      if (path.constructor === Array) {
        let klass = this;

        _.each(path, function(route) {
          klass._setPathExtension(route, name, func);
        });
      } else {
        this._setPathExtension(path, name, func);
      }
    },

    extend(path, controller) {
      var methods = this._getPathExtensions(path);

      if (methods) {
        _.extend(controller, methods);

        for(var method in methods) {
          _.bindAll(controller, method);
        }
      }
    },

    _setPathExtension(path, name, func) {
      var extensions = this._getPathExtensions(path);

      if (!extensions) {
        extensions = this.pathExtensions[path] = {};
      }

      if (typeof name == "string") {
        extensions[name] = func;
      } else {
        _.extend(extensions, name);
      }
    },

    _getPathExtensions(path) {
      if (!this.pathExtensions) {
        this.pathExtensions = {};
      }

      return this.pathExtensions[path];
    }
  };
}(window._, local));
