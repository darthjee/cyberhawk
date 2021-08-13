
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

// underscore_ext.js
(function(_) {
  _.squeeze = function(array){
    return _.select(array, function(e, i) {
      return i === 0 || e !== array[i-1];
    });
  };
})(window._);

// paginator.js
//PAGINATOR
(function(_, angular, Cyberhawk, undefined) {
  var module = angular.module("cyberhawk/paginator", []);

  function PaginatorFactory() {
    return Paginator;
  }

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

  Paginator.block_size = 3;
  Paginator.build = function(data) {
    return new Paginator(this.block_size, data.pages, data.page).build();
  };

  Cyberhawk.Paginator = Paginator;
  module.factory("cyberhawk_paginator", [PaginatorFactory]);
})(window._, window.angular, window.Cyberhawk);


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

  Cyberhawk.PaginationService = PaginationService;

  function PaginationServiceFactory(builder) {
    return new PaginationService(builder);
  }

  module.service("cyberhawk_pagination", [
    "cyberhawk_paginator",
    PaginationServiceFactory
  ]);

  Cyberhawk.PaginationService = PaginationService;
}(window._, window.angular, window.Cyberhawk));


// controller.js
(function(_, angular, Cyberhawk) {
  function Controller(builder, notifier, $location, $timeout, pagination) {
    this.construct(builder.build($location), notifier, $location, $timeout, pagination);
  }

  var fn = Controller.prototype,
      app = angular.module("cyberhawk/controller", [
        "cyberhawk/notifier", "cyberhawk/requester",
        "cyberhawk/pagination"
      ]);

  fn.construct = function(requester, notifier, $location, $timeout, pagination) {
    this.requester = requester;
    this.notifier = notifier;
    this.pagination = pagination;
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
    this._setPagination(response);
    this.data = response.data;
    this.loaded = true;
  };

  fn._setPagination = function(response) {
    if (this.pagination) {
      this.pagination.parse(response);
    }
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
    "cyberhawk_pagination",
    Controller
  ]);

  Cyberhawk.Controller = Controller;
}(window._, window.angular, window.Cyberhawk));

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
      if (this.path.match(/new.json$/)) {
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

  RequesterServiceBuilder.prototype.build = function($location) {
    var query = querystring.encode($location.$$search),
      path = $location.$$path + ".json?" + query,
      savePath = $location.$$path.replace(/\/(new|edit)$/, "") + ".json";

    return new RequesterService(path, savePath, this.http);
  };

  function RequesterServiceFactory($http) {
    return new RequesterServiceBuilder($http);
  }

  module.service("cyberhawk_requester", [
    "binded_http",
    RequesterServiceFactory
  ]);
}(window._, window.angular, window.Cyberhawk, window.querystring));

