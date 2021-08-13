(function(_) {
  _.squeeze = function(array){
    return _.select(array, function(e, i) {
      return i === 0 || e !== array[i-1];
    });
  };
})(window._);
