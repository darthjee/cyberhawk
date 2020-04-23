//REQUESTER
(function(_, angular, Cyberhawk) {
  RequesterServiceBuilder.prototype.build = function($location) {
    var path = $location.$$path + ".json";
    var savePath = $location.$$path.replace(/\/(new|edit)$/, "") + ".json";
    return new RequesterService(path, savePath, this.http);
  };

  function RequesterService(path, savePath, $http) {
    this.path = path;
    this.savePath = savePath;
    this.http = $http;
    _.bind(this.request, this);
  }

  var fn = RequesterService.prototype,
      module = angular.module("cyberhawk/requester", []);

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

  function RequesterServiceFactory($http) {
    return new RequesterServiceBuilder($http);
  }

  module.service("cyberhawk_requester", [
    "$http",
    RequesterServiceFactory
  ]);
}(window._, window.angular, window.Cyberhawk));
