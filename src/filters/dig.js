(function(angular, _) {
  class Digger {
    constructor(input, keys) {
      this.input = input;
      this.keys = keys.split(".");
    }

    dig() {
      return _.reduce(this.keys, this.reduce, this.input);
    }

    reduce(result, key) {
      return result && result[key];
    }
  }

  Digger.dig = function(input, keys) {
    return new Digger(input, keys).dig();
  };

  angular
    .module("cyberhawk")
    .filter("dig", function() { return Digger.dig; });
}(window.angular, window._));
