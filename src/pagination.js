//PAGINATION
(function(_, angular, Cyberhawk) {
  function PaginationService() {
    this.pages = 1;
    this.page = 1;
  }

  var fn = PaginationService.prototype,
      module = angular.module("cyberhawk/pagination", []);

  Cyberhawk.PaginationService = PaginationService;

  fn.parse = function(response) {
    this.pages    = response.headers('pages');
    this.page     = response.headers('page');
    this.per_page = response.headers('per_page');
  };

  function PaginationServiceFactory() {
    return new PaginationService();
  }

  module.service("cyberhawk_pagination", [
    PaginationServiceFactory
  ]);
}(window._, window.angular, window.Cyberhawk));

