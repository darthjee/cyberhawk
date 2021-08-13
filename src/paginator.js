//PAGINATOR
(function(_, angular, Cyberhawk, undefined) {
  function PaginatorFactory() {
    return Paginator;
  }

  function Paginator(blockSize, pages, current) {
    this.blockSize = blockSize;
    this.pages = pages;
    this.current = current;
  }

  var module = angular.module("cyberhawk/paginator", []),
      fn = Paginator.prototype;

  Paginator.from_data = function(block_size, data) {
    return new Paginator(block_size, data.pages, data.page);
  };

  fn.build = function() {
    var list, that = this;

    list = _.map(new Array(this.pages), function(_, index) {
      var page =  index + 1;
      if (that.isPageListable(page)) {
        return page;
      }
      return null;
    });

    return _.squeeze(list);
  };

  fn.isPageListable = function(page) {
    var total = this.pages,
        current = this.current,
        blockSize = this.blockSize;

    return page <= blockSize ||
           page > total - blockSize ||
           Math.abs(page - current) < blockSize ||
           (Math.abs(page - current) <= blockSize && page <= (blockSize+1)) ||
           (Math.abs(page - current) <= blockSize && page >= total - blockSize);
  };

  Cyberhawk.Paginator = Paginator;
  module.factory("cyberhawk_paginator", [PaginatorFactory]);
})(window._, window.angular, window.Cyberhawk);

