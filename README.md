# cyberhawk

This package adds several ready to use classes for an Angular2 project

## Usage

### controller

Controller already knows how to request for the data based on the URL

Upon entering `http://myurl.com#/angular/path` the controller will request data from `http://myurl.com/angular/path.json`

For pages that show a form, the controller will have an attribute `data` which will contain the data of the form,
and a method `save` so that the form can be submitted

For pages that show content, the controller will load the content into the `data` attribute

```javascript
var app = angular.module("my_controller", [
  "cyberhawk/requester",
  "cyberhawk/controller",
  "cyberhawk/notifier",
]);

function Controller(builder, notifier, $location) {
  this.construct(builder.build($location), notifier, $location);
}

var fn = Controller.prototype;

_.extend(fn, Cyberhawk.Controller.prototype);

app.controller("Simulation.NewController", [
  "cyberhawk/requester", "cyberhawk_notifier", "$location",
  Controller
]);

```

### requester
Requester is used with the controller, being able to easily request data or post data to be saved

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
