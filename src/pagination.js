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

