//PAGINATION
(function(_, angular, Cyberhawk) {
  var module = angular.module("cyberhawk/pagination", []);

  class PaginationService {
    constructor() {
      this.pages = 1;
      this.page = 1;
    }

    parse(response) {
      this.pages    = response.headers('pages');
      this.page     = response.headers('page');
      this.per_page = response.headers('per_page');
    }
  }

  Cyberhawk.PaginationService = PaginationService;

  function PaginationServiceFactory() {
    return new PaginationService();
  }

  module.service("cyberhawk_pagination", [
    PaginationServiceFactory
  ]);
}(window._, window.angular, window.Cyberhawk));

