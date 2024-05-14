(function(_, local) {
  local.ExtensionMethods = {
    withPath: function(path, name, func) {
      if (path.constructor == Array) {
        let klass = this;

        return _.each(path, function(route) {
          klass.withPath(route, name, func);
        });
      }

      if (!this.pathExtensions[path]) {
        this.pathExtensions[path] = {};
      }

      if (typeof name == "string") {
        this.pathExtensions[path][name] = func
      } else {
        _.extend(this.pathExtensions[path], name);
      }
    },

    extensionFor: function(path) {
      return this.pathExtensions[path] || {};
    },

    extend: function(path, controller) {
      var methods = this.extensionFor(path);

      _.extend(controller, methods);

      for(method in methods) {
        _.bindAll(controller, method)
      }
    },

    pathExtensions: {}
  };
}(_, local));