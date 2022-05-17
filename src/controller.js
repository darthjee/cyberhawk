(function(_, angular, Cyberhawk) {
  function Controller() {
    this.construct.apply(this, arguments);
  }

  var fn = Controller.prototype,
    app = angular.module("cyberhawk/controller", [
      "cyberhawk/notifier", "cyberhawk/requester",
      "cyberhawk/pagination"
    ]),

    HooksMethods = {
      on: function(path, event, func) {
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

      pathHooks: {}
    },

    ExtensionMethods = {
      withPath: function(path, name, func) {
        if (!this.pathExtensions[path]) {
          this.pathExtensions[path] = {};
        }

        this.pathExtensions[path][name] = func;
      },

      extensionFor: function(path) {
        return this.pathExtensions[path] || {};
      },

      extend: function(path, controller) {
        _.extend(controller, this.extensionFor(path));
      },

      pathExtensions: {}
    };

  _.extend(Controller, HooksMethods, ExtensionMethods);

  _.extend(fn, {
    construct: function(requesterBuilder, notifier, $location, $timeout, pagination, route) {
      this.requester = requesterBuilder.build($location);
      this.notifier = notifier;
      this.pagination = pagination;
      this.location = $location;
      this.$timeout = $timeout;
      this.routeParams = route.current.pathParams;
      this.route = route.current.$$route.route

      this.constructor.extend(this.route, this);
      _.bindAll(this, "execute", "_setData", "save", "request", "_goIndex", "_error");
      this.requester.bind(this);
      this.request();
    },

    execute: function(functions) {
      var that = this;

      _.each(functions, function(func) {
        if (typeof func == "string") {
          that[func]();
        } else {
          func.apply(that);
        }
      });
    },

    request: function() {
      var promise = this.requester.request();
      promise.then(this._setData);

      this.execute(Controller.pathHooksFor(this.route, 'request'));
    },

    _setData: function(response) {
      this._setPagination(response);
      this.data = response.data;
      this.loaded = true;
    },

    _setPagination: function(response) {
      if (this.pagination) {
        this.pagination.parse(response);
      }
    },

    save: function() {
      var promise = this.requester.saveRequest(this.payload());

      promise.then(this._setData);
      promise.then(this._goIndex);
      promise.error(this._error);
    },

    payload: function() {
      return this.data;
    },

    _error: function(data, responseStatus) {
      if(responseStatus === 422) {
        this.data = data;
      }
    },

    _goIndex: function() {
      this.location.path(this.location.$$path.replace(/\/(edit|new)$/, ""));
    },

    delete: function(id) {
      var promise = this.requester.deleteRequest(id);
      promise.then(this.request);
    }
  });

  app.controller("Cyberhawk.Controller", [
    "cyberhawk_requester",
    "cyberhawk_notifier",
    "$location",
    "$timeout",
    "cyberhawk_pagination",
    "$route",
    Controller
  ]);

  Cyberhawk.Controller = Controller;
}(window._, window.angular, window.Cyberhawk));
