//PAGINATION
(function(_, angular, Cyberhawk) {
  function PaginationService() {
  }

  var fn = PaginationService.prototype,
      module = angular.module("cyberhawk/pagination", []);

  Cyberhawk.PaginationService = PaginationService;

  function PaginationServiceFactory() {
    return new PaginationService();
  }

  module.service("cyberhawk_pagination", [
    PaginationServiceFactory
  ]);
}(window._, window.angular, window.Cyberhawk));

