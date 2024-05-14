(function(angular) {
  angular
    .module("cyberhawk")
    .filter("number", function() {
      return function(input) {
        if (!input) {
          return;
        }

        return parseInt(input);
      };
    });
})(window.angular);
