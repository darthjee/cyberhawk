//PAGINATOR
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
}(_, angular, local.Cyberhawk));

