(function() {
  var local = {};
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
(function(angular, global, local) {
  local.Cyberhawk = global.Cyberhawk = {};

  angular.module("cyberhawk", [
    "cyberhawk/requester", "cyberhawk/controller",
    "cyberhawk/config", "cyberhawk/builder"
  ]);
}(window.angular, window, local));

// underscore_ext.js
(function(_) {
  _.squeeze = function(array){
    return _.select(array, function(e, i) {
      return i === 0 || e !== array[i-1];
    });
  };
}(window._));

// paginator.js
(function(_, angular, Cyberhawk) {
  var module = angular.module("cyberhawk/paginator", []);

  class Paginator {
    constructor(blockSize, pages, current) {
      this.blockSize = blockSize;
      this.pages = pages;
      this.current = current;
    }

    build() {
      var list, that = this;

      list = _.map(new Array(this.pages), function(_, index) {
        var page =  index + 1;
        if (that.isPageListable(page)) {
          return page;
        }
        return null;
      });

      return _.squeeze(list);
    }

    isPageListable(page) {
      var total = this.pages,
        current = this.current,
        blockSize = this.blockSize;

      return page <= blockSize ||
             page > total - blockSize ||
             Math.abs(page - current) < blockSize ||
             (Math.abs(page - current) <= blockSize && page <= (blockSize+1)) ||
             (Math.abs(page - current) <= blockSize && page >= total - blockSize);
    }
  }

  Paginator.blockSize = 3;
  Paginator.build = function(data) {
    return new Paginator(this.blockSize, data.pages, data.page).build();
  };

  function PaginatorFactory() {
    return Paginator;
  }

  Cyberhawk.Paginator = Paginator;
  module.factory("cyberhawk_paginator", [PaginatorFactory]);
}(window._, window.angular, local.Cyberhawk));

// pagination.js
//PAGINATION
(function(_, angular, Cyberhawk) {
  var module = angular.module("cyberhawk/pagination", [
    "cyberhawk/paginator"
  ]);

  class PaginationService {
    constructor(builder) {
      this.pages   = 1;
      this.page    = 1;
      this.builder = builder;
    }

    parse(response) {
      if (response.headers("pages")) {
        this.pages   = Number.parseInt(response.headers("pages"));
        this.page    = Number.parseInt(response.headers("page"));
        this.perPage = Number.parseInt(response.headers("per_page"));

        this.pagination = this.builder.build(this);
      }
    }
  }
  class PaginationBuilderService {
    constructor(builder) {
      this.builder = builder;
    }

    build(pagination) {
      return new PaginationService(this.builder);
    }
  }

  Cyberhawk.PaginationService = PaginationService;

  function PaginationServiceFactory(builder) {
    return new PaginationBuilderService(builder);
  }

  module.service("cyberhawk_pagination", [
    "cyberhawk_paginator",
    PaginationServiceFactory
  ]);

  Cyberhawk.PaginationService = PaginationService;
}(window._, window.angular, local.Cyberhawk));


// hooks_methods.js
(function(_, local) {
  local.HooksMethods = {
    on(path, event, func) {
      if (path.constructor == Array) {
        let klass = this;

        _.each(path, function(route) {
          klass._setPathHooks(route, event, func);
        });
      } else {
        this._setPathHooks(path, event, func);
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
      var hooks = this._getPathHooks(path, event);

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

// extension_methods.js
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

// controller_methods.js
(function(_, local) {
  local.ControllerMethods = {
    construct(requesterBuilder, notifier, $location, $timeout, pagination, route) {
      this.requesterBuilder = requesterBuilder;
      this.notifier = notifier;
      this.pagination = pagination;
      this.location = $location;
      this.$timeout = $timeout;
      this.routeParams = route.current.pathParams;
      this.route = route.current.$$route.route;

      this.constructor.extend(this.route, this);
      this.bindMethods();
      this.request();
    },

    bindMethods() {
      _.bindAll(this, "_setData", "save", "request", "_goIndex", "_error", "_triggerSaved");
    },

    request() {
      var promise = this._getRequester().request();
      promise.then(this._setData);

      this.constructor.trigger(this, this.route, "request");
    },

    _setData(response) {
      this._setPagination(response);
      this.data = response.data;
      this.loaded = true;
      this.constructor.trigger(this, this.route, "loaded");
    },

    _setPagination(response) {
      if (this.pagination) {
        this.pagination.parse(response);
      }
    },

    save() {
      var promise = this._getRequester().saveRequest(this.payload());

      promise.then(this._setData);
      promise.then(this._triggerSaved);
      promise.then(this._goIndex);
      promise.error(this._error);
    },

    _triggerSaved() {
      this.constructor.trigger(this, this.route, "saved");
    },

    payload() {
      return this.data;
    },

    _error(data, responseStatus) {
      if(responseStatus === 422) {
        this.data = data;
      }
    },

    _goIndex() {
      this.location.path(this.path.replace(/\/(edit|new)$/, ""));
    },

    delete(id) {
      var promise = this.getRequester().deleteRequest(id);
      promise.then(this.request);
    },

    _getRequester() {
      if ( !this.requester ) {
        this._buildRequester();
      }

      return this.requester;
    },

    _buildRequester() {
      this.requester = this.requesterBuilder.build(this._requesterAttributes());
      this.requester.bind(this);
    },

    _requesterAttributes() {
      return {
        search: this.location.$$search,
        path: this._getPath()
      }
    },

    _getPath() {
      if ( this.path.constructor == String ) {
        return this.path;
      }

      return this.location.$$path;
    }
  };
}(window._, local));

// controller.js
(function(_, angular, local) {
  var Cyberhawk = local.Cyberhawk,
    HooksMethods = local.HooksMethods,
    ExtensionMethods = local.ExtensionMethods,
    ControllerMethods = local.ControllerMethods;

  function Controller() {
    this.construct.apply(this, arguments);
  }

  var fn = Controller.prototype,
    app = angular.module("cyberhawk/controller", [
      "cyberhawk/notifier", "cyberhawk/requester",
      "cyberhawk/pagination"
    ]);

  _.extend(Controller, HooksMethods, ExtensionMethods);

  _.extend(fn, ControllerMethods);

  app.controller("Cyberhawk.Controller", [
    "cyberhawk_builder", function(builder) { builder.buildAndRequest(this); }
  ]);

  Cyberhawk.Controller = Controller;
}(window._, window.angular, local));

// notifier.js
(function(_, angular, Cyberhawk) {
  var module = angular.module("cyberhawk/notifier", []);

  class NotifierService {
    constructor() {
      this.watchs = {};
    }

    notify(key, value) {
      _.each(this.listeners(key), function(callback) {
        callback(value);
      });
    }

    register(key, callback) {
      this.listeners(key).push(callback);
    }

    listeners(key) {
      if (typeof this.watchs[key] === "undefined") {
        this.watchs[key] = [];
      }
      return this.watchs[key];
    }
  }

  Cyberhawk.NotifierServiceFactory = function() {
    return new NotifierService();
  };

  module.service("cyberhawk_notifier", [Cyberhawk.NotifierServiceFactory]);
}(window._, window.angular, local.Cyberhawk));

// binded_http.js
(function(_, angular) {
  var module = angular.module("binded_http", []);

  class Controller {}

  _.extend(Controller.prototype,{
    initRequest(promisse) {
      if (!this.requests) {
        this.requests = [];
      }

      this.requests.push(promisse);

      this.finishRequest();
    },
    finishRequest() {
      this.requests = _.select(this.requests, function(promisse) {
        return promisse.$$state.status == 0
      });

      if (this.requests.length == 0) {
        this.ongoing = false;
      }
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
    BindedHttpService, "http", "get", "post", "patch", "delete"
  );

  function watch(original) {
    var promisse = original();

    this.controller.initRequest(promisse);

    promisse.finally(this.controller.finishRequest)
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
(function(_, angular, Cyberhawk, querystring) {
  var module = angular.module("cyberhawk/requester", ["binded_http"]);

  class RequesterService {
    constructor(path, savePath, $http) {
      this.path = path;
      this.savePath = savePath;
      this.http = $http;

      _.bind(this.request, this);
    }

    bind(controller) {
      this.http.bind(controller);
    }

    request(callback) {
      return this.http.get(this.path);
    }

    saveRequest(data) {
      if (this.path.match(/new.json(\?.*)?$/)) {
        return this.http.post(this.savePath, data);
      } else {
        return this.http.patch(this.savePath, data);
      }
    }

    deleteRequest(id) {
      return this.http.delete(this.path.replace(/(\.json)?$/, "/" + id + ".json"));
    }
  }

  Cyberhawk.RequesterService = RequesterService;

  function RequesterServiceBuilder($http) {
    this.http = $http;
  }

  RequesterServiceBuilder.prototype.build = function(attributes) {
    var query = querystring.encode(attributes.search),
      path = attributes.path + ".json?" + query,
      savePath = attributes.path.replace(/\/(new|edit)$/, "") + ".json";

    return new RequesterService(path, savePath, this.http);
  };

  function RequesterServiceFactory($http) {
    return new RequesterServiceBuilder($http);
  }

  module.service("cyberhawk_requester", [
    "binded_http",
    RequesterServiceFactory
  ]);
}(window._, window.angular, local.Cyberhawk, window.querystring));

// filters/dig.js
(function(angular, _) {
  class Digger {
    constructor(input, keys) {
      this.input = input;
      this.keys = keys.split(".");
    }

    dig() {
      return _.reduce(this.keys, this.reduce, this.input);
    }

    reduce(result, key) {
      return result && result[key];
    }
  }

  Digger.dig = function(input, keys) {
    return new Digger(input, keys).dig();
  };

  angular
    .module("cyberhawk")
    .filter("dig", function() { return Digger.dig; });
}(window.angular, window._));

// filters/percentage.js
(function(angular, _) {
  class Percentage {
    constructor(input) {
      this.input = input;
    }

    toString() {
      if (this.input) {
        return "" + (this.input * 100).toFixed(2) + " %";
      } else {
        return "0 %";
      }
    }
  }

  Percentage.parse = function(input) {
    return new Percentage(input).toString();
  };

  angular
    .module("cyberhawk")
    .filter("percentage", function() {
      return Percentage.parse;
    });
}(window.angular, window._));

// filters/select_options.js
(function(angular, _) {
  class Finder {
    constructor(input, mappings, key) {
      this.input = input;
      this.mappings = mappings;
      this.key = key;
    }

    find() {
      var input = this.input,
          key = this.key;

      if (input === null) {
        return null;
      }

      return _.find(this.mappings, function(object) {
        return object[key] === input;
      });
    }
  }

  Finder.find = function(input, mappings, key) {
    return new Finder(input, mappings, key).find();
  };

  angular
    .module("cyberhawk")
    .filter("select_transformer", function() {
      return Finder.find;
    });
}(window.angular, window._));

// filters/string.js
(function(angular) {
  angular
    .module("cyberhawk")
    .filter("string", function() {
      return function(input) { 
        return input.toString();
      };
    });
})(window.angular);

// filters/number.js
(function(angular) {
  angular
    .module("cyberhawk")
    .filter("number", function() {
      return function(input) {
        if (!input) {
          return;
        }

        return parseInt(input);
      };
    });
})(window.angular);

// config.js
(function(_, angular, Cyberhawk) {
  class Config {
    constructor() {
      this.controller = Cyberhawk.Controller;
    }
  }

  // Old prototype style, can't get rid of it :(
  function CyberhawkProvider() {
    _.bindAll(this, '$get');
  };

  var module = angular.module('cyberhawk/config', []),
    fn = CyberhawkProvider.prototype;

  fn.$get = function() {
    return this.config || this._build();
  };

  fn._build = function() {
    return this.config = new Config();
  };

  module.provider('cyberhawk', CyberhawkProvider);
}(window._, window.angular, local.Cyberhawk));

// controller_builder.js
(function(_, angular, local) {
  var HooksMethods = local.HooksMethods,
    ExtensionMethods = local.ExtensionMethods,
    ControllerMethods = local.ControllerMethods,

    module = angular.module("cyberhawk/builder", [
      "cyberhawk/notifier", "cyberhawk/requester",
      "cyberhawk/pagination"
    ]);

  class Builder {
    constructor(controller, attributes, options) {
      this.controller = controller;
      this.attributes = attributes;
      this.options    = options
    }

    build() {
      if (!this._isBuilt()) {
        this._addMethods();
      }

      _.extend(this.controller, this.attributes);

      this._bind();
      this._callback();
    }

    _callback() {
      if (this.options.callback) {
        this.options.callback.apply(this.controller);
      }
    }

    _isBuilt() {
      var constructor = this.controller.constructor;

      return constructor.cyberhawk;
    }

    _addMethods() {
      var constructor = this.controller.constructor,
        prototype = _.extend(ControllerMethods, constructor.prototype),
        methods =  _.extend(HooksMethods, ExtensionMethods, constructor);;

      _.extend(constructor.prototype, prototype);
      _.extend(constructor, methods);

      constructor.extend(this.attributes.route, this.controller);
      constructor.cyberhawk = true;
    }

    _bind() {
      this.controller.bindMethods();
    }
  }

  class ControllerBuilderService {
    constructor(requesterBuilder, notifier, $location, $timeout, pagination, route, global_state) {
      this.requesterBuilder = requesterBuilder;
      this.notifier = notifier;
      this.pagination = pagination;
      this.$location = $location;
      this.$timeout = $timeout;
      this.route = route;
      this.global_state = global_state;
    }

    build(controller, options) {
      if (options == undefined) {
        options = {};
      } else if (options.constructor == Function) {
        options = {
          callback: options
        };
      }
      this.options = options;

      new Builder(controller, this.attributes(), options).build();
    }

    buildAndRequest(controller, options) {
      this.build(controller, options);

      controller.request();
    }

    attributes() {
      return {
        requesterBuilder: this.requesterBuilder,
        notifier: this.notifier,
        pagination: this.pagination.build(),
        location: this.$location,
        $timeout: this.$timeout,
        global_state: this.global_state,
        routeParams: this.fetchAttribute("routeParams", function() {
          return this.route.current.pathParams;
        }),
        route: this.fetchAttribute("route", function() {
          return this.route.current.$$route.route;
        }),
        path: this.fetchAttribute("path", function() {
          return this.$location.$$path;
        }),
      };
    }

    fetchAttribute(name, def) {
      return this.options[name] || def.apply(this);
    }
  }

  function ControllerBuilderServiceFactory(requesterBuilder, notifier, $location, $timeout, pagination, route, global_state) {
    return new ControllerBuilderService(requesterBuilder, notifier, $location, $timeout, pagination, route, global_state);
  }

  module.service("cyberhawk_builder", [
    "cyberhawk_requester",
    "cyberhawk_notifier",
    "$location",
    "$timeout",
    "cyberhawk_pagination",
    "$route",
    "cyberhawk_global_state",
    ControllerBuilderServiceFactory
  ]);
}(window._, window.angular, local));

// global_state.js
(function(_, angular) {
  var module = angular.module("cyberhawk", []);


  class GlobalStateService {
    constructor() {
      this.id = Math.floor(Math.random() * 1000000);
    }
  }

  function GlobalStateServiceFactory($http) {
    return new GlobalStateService($http);
  }

  module.service("cyberhawk_global_state", [
    GlobalStateServiceFactory
  ]);
}(window._, window.angular));  

}());
