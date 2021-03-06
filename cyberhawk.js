
// delegator.js
(function(_) {
  class Delegator {
    constructor(caller, objectName) {
      this.caller = caller;
      this.objectName = objectName;
      _.bindAll(this, "delegate");
    }

    delegate(method) {
      var objectName = this.objectName;

      this.caller.prototype[method] = function() {
        var object = this[objectName];

        return object[method].apply(object, arguments);
      };
    }
  }

  _.delegate = function(caller, object) {
    var methods = [].slice.call(arguments, 2),
      delegator = new Delegator(caller, object);

    _.each(methods, delegator.delegate);
  };
}(window._));

// function_wrapper.js
(function(_) {
  class FunctionWrapper {
    constructor(object, method, wrapper) {
      this.object = object;
      this.method = method;
      this.wrapper = wrapper;
      this.original = object[method];
    }

    wrap(bindArguments) {
      var that = this;

      return function() {
        var binded = that._bind(that.original, this, arguments, bindArguments);
        var args = [binded].concat([].slice.call(arguments, 0));

        return that.wrapper.apply(this, args);
      };
    }

    _bind(func, caller, args, bindArguments) {
      if (bindArguments) {
        return function() {
          return func.apply(caller, args);
        };
      } else {
        return _.bind(func, caller);
      }
    }
  }

  _.wrapFunction = function(object, method, wrapper, bindArguments) {
    var functionWrapper = new FunctionWrapper(object, method, wrapper);

    object[method] = functionWrapper.wrap(bindArguments);
  };

  _.wrapFunctions = function(object, methods, bindArguments) {
    for (var method in methods) {
      if (methods.hasOwnProperty(method)) {
        var wrapper = methods[method],
          functionWrapper = new FunctionWrapper(object, method, wrapper);

        object[method] = functionWrapper.wrap(bindArguments);
      }
    }
  };
}(window._));

// cyberhawk.js
(function(angular, global) {
  global.Cyberhawk = {};

  angular.module("cyberhawk", [
    "cyberhawk/requester", "cyberhawk/controller"
  ]);
}(window.angular, window));

// controller.js
(function(_, angular, Cyberhawk) {
  function Controller(builder, notifier, $location, $timeout) {
    this.construct(builder.build($location), notifier, $location, $timeout);
  }

  var fn = Controller.prototype,
      app = angular.module("cyberhawk/controller", [
        "cyberhawk/notifier", "cyberhawk/requester"
      ]);

  fn.construct = function(requester, notifier, $location, $timeout) {
    this.requester = requester;
    this.notifier = notifier;
    this.location = $location;
    this.$timeout = $timeout;

    _.bindAll(this, "_setData", "save", "request", "_goIndex", "_error");
    this.requester.bind(this);
    this.request();
  };

  fn.request = function() {
    var promise = this.requester.request();
    promise.then(this._setData);
  };

  fn._setData = function(response) {
    this.data = response.data;
    this.loaded = true;
  };

  fn.save = function() {
    var promise = this.requester.saveRequest(this.payload());
    promise.then(this._setData);
    promise.then(this._goIndex);
    promise.error(this._error);
  };

  fn.payload = function() {
    return this.data;
  };

  fn._error = function(data, responseStatus) {
    if(responseStatus === 422) {
      this.data = data;
    }
  };

  fn._goIndex = function() {
    this.location.path(this.location.$$path.replace(/(\w*\/edit|new)/, ""));
  };

  fn.delete = function(id) {
    var promise = this.requester.deleteRequest(id);
    promise.then(this.request);
  };

  app.controller("Cyberhawk.Controller", [
    "cyberhawk_requester",
    "cyberhawk_notifier",
    "$location",
    "$timeout",
    Controller
  ]);

  Cyberhawk.Controller = Controller;
}(window._, window.angular, window.Cyberhawk));

// notifier.js
(function(_, angular, Cyberhawk) {
  var module = angular.module("cyberhawk/notifier", []);

  function NotifierService() {
    this.watchs = {};
  }

  var fn = NotifierService.prototype;

  fn.notify = function(key, value) {
    _.each(this.listeners(key), function(callback) {
      callback(value);
    });
  };

  fn.register = function(key, callback) {
    this.listeners(key).push(callback);
  };

  fn.listeners = function(key) {
    if (typeof this.watchs[key] === "undefined") {
      this.watchs[key] = [];
    }
    return this.watchs[key];
  };

  Cyberhawk.NotifierServiceFactory = function() {
    return new NotifierService();
  };

  module.service("cyberhawk_notifier", [Cyberhawk.NotifierServiceFactory]);
}(window._, window.angular, window.Cyberhawk));

// binded_http.js
(function(_, angular) {
  var module = angular.module("binded_http", []);

  class Controller {}

  _.extend(Controller.prototype,{
    initRequest() {
      this.ongoing = true;
    },
    finishRequest() {
      this.ongoing = false;
    }
  });

  class BindedHttpService {
    constructor($http) {
      this.http = $http;
      this.controller = new Controller();
    }

    bind(controller) {
      for (var method in Controller.prototype) {
        if (! controller[method]) {
          var bindedMethod = _.bind(Controller.prototype[method], controller);
          controller[method] = bindedMethod;
        }
      }

      this.controller = controller;
      return this;
    }
  }

  _.delegate(
    BindedHttpService, "http", "get", "post", "delete"
  );


  function watch(original) {
    this.controller.initRequest();
    var promisse = original();

    promisse.finally(this.controller.finishRequest);
    return promisse;
  }

  var middleware = {
    post: watch,
    get: watch,
    delete: watch
  };

  _.wrapFunctions(
    BindedHttpService.prototype, middleware, true
  );

  function BindedHttpServiceFactory($http) {
    return new BindedHttpService($http);
  }

  module.service("binded_http", [
    "$http",
    BindedHttpServiceFactory
  ]);
}(window._, window.angular));

// requester.js
//REQUESTER
(function(_, angular, Cyberhawk) {
  function RequesterService(path, savePath, $http) {
    this.path = path;
    this.savePath = savePath;
    this.http = $http;

    _.bind(this.request, this);
  }

  var fn = RequesterService.prototype,
      module = angular.module("cyberhawk/requester", ["binded_http"]);

  fn.bind = function(controller) {
    this.http.bind(controller);
  };

  fn.request = function(callback) {
    return this.http.get(this.path);
  };

  fn.saveRequest = function(data) {
    if (this.path.match(/new.json$/)) {
      return this.http.post(this.savePath, data);
    } else {
      return this.http.patch(this.savePath, data);
    }
  };

  fn.deleteRequest = function(id) {
    return this.http.delete(this.path.replace(/(\.json)?$/, "/" + id + ".json"));
  };

  Cyberhawk.RequesterService = RequesterService;

  function RequesterServiceBuilder($http) {
    this.http = $http;
  }

  RequesterServiceBuilder.prototype.build = function($location) {
    var path = $location.$$path + ".json";
    var savePath = $location.$$path.replace(/\/(new|edit)$/, "") + ".json";
    return new RequesterService(path, savePath, this.http);
  };

  function RequesterServiceFactory($http) {
    return new RequesterServiceBuilder($http);
  }

  module.service("cyberhawk_requester", [
    "binded_http",
    RequesterServiceFactory
  ]);
}(window._, window.angular, window.Cyberhawk));

