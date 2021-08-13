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

  Paginator.from_data = function(block_size, data) {
    return new Paginator(block_size, data.pages, data.page);
  };

  Cyberhawk.Paginator = Paginator;
  module.factory("cyberhawk_paginator", [PaginatorFactory]);
})(window._, window.angular, window.Cyberhawk);

