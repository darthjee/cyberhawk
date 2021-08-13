//PAGINATION
(function(_, angular, Cyberhawk) {
  var module = angular.module("cyberhawk/pagination", []);

  class PaginationService {
    constructor() {
      this.pages = 1;
      this.page = 1;
    }

    parse(response) {
      if (response.headers("pages")) {
        this.pages   = Number.parseInt(response.headers("pages"));
        this.page    = Number.parseInt(response.headers("page"));
        this.perPage = Number.parseInt(response.headers("per_page"));

        this.pagination = Cyberhawk.Paginator.from_data(3, this).build();
      }
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

