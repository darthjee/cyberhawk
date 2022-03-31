# cyberhawk

This package adds several ready to use classes for an Angular2 project

## Usage

### controller

Controller already knows how to request for the data based on the URL

upon entering `http://myurl.com#/angular/path` the controller will request data from `http://myurl.com/angular/path.json`

```javascript
var app = angular.module("my_controller", [
  "some_requester",
  "cyberhawk/controller",
  "cyberhawk/notifier",
]);

function Controller(builder, notifier, $location) {
  this.construct(builder.build($location), notifier, $location);
}

var fn = Controller.prototype;

_.extend(fn, Cyberhawk.Controller.prototype);

fn.payload = function() {
  return {
    data: this.data
  }
};

app.controller("Simulation.NewController", [
  "some_requester", "cyberhawk_notifier", "$location",
  Controller
]);

```

### binded_http

binds an http requester to a controller

```javascript
var app = angular.module("my_controller", [
  "cyberhawk/notifier",
  "binded_http"
]);

function Controller(http) {
  this.http = http.bind(this);
  this.http.bind(self);
}

var fn = Controller.prototype;

fn.request = function(address) {
  this.http.get(address);
};

fn.initRequest = function() { // this will be used to show an ongoing request icon
  this.ongoing = true;
}

fn.finishRequest = function() { // this will be used to hide an ongoing request icon
  this.ongoing = true;
}

app.controller("MController", [
  "binded_http",
  Controller
]);
```
