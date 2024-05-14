(function(angular) {
  angular
    .module("cyberhawk")
    .filter("string", function() {
      return function(input) { 
        return input.toString();
      };
    });
})(angular);
