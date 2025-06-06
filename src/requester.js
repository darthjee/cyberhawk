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
        return this.createRequest(data)
      } else {
        return this.updateRequest(data)
      }
    }

    createRequest(data) {
      return this.http.post(this.savePath, data);
    }

    updateRequest(data) {
      return this.http.patch(this.savePath, data);
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
