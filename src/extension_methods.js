(function(_, local) {
  local.ExtensionMethods = {
    withPath(path, name, func) {
      if (path.constructor === Array) {
        let klass = this;

        return _.each(path, function(route) {
          klass.withPath(route, name, func);
        });
      }

      if (!this.getPathExtensions(path)) {
        this.getPathExtensions(path) = {};
      }

      if (typeof name == "string") {
        this.getPathExtensions(path)[name] = func;
      } else {
        _.extend(this.getPathExtensions(path), name);
      }
    },

    extensionFor(path) {
      return this.getPathExtensions(path) || {};
    },

    extend(path, controller) {
      var methods = this.extensionFor(path);

      _.extend(controller, methods);

      for(var method in methods) {
        _.bindAll(controller, method);
      }
    },

    getPathExtensions(path) {
      if (!this.pathExtensions) {
        this.pathExtensions = {}
      }
    }
  };
}(window._, local));
