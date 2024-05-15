(function(_, local) {
  local.ExtensionMethods = {
    withPath(path, name, func) {
      if (path.constructor === Array) {
        let klass = this;

        _.each(path, function(route) {
          klass.setPathExtension(route, name, func);
        });
      } else {
        this.setPathExtension(path, name, func);
      }
    },

    extend(path, controller) {
      var methods = this.getPathExtensions(path);

      if (methods) {
        _.extend(controller, methods);

        for(var method in methods) {
          _.bindAll(controller, method);
        }
      }
    },

    setPathExtension(path, name, func) {
      var extensions = this.getPathExtensions(path);

      if (!extensions) {
        extensions = this.pathExtensions[path] = {};
      }

      if (typeof name == "string") {
        extensions[name] = func;
      } else {
        _.extend(extensions, name);
      }
    },

    getPathExtensions(path) {
      if (!this.pathExtensions) {
        this.pathExtensions = {};
      }

      return this.pathExtensions[path];
    }
  };
}(window._, local));
