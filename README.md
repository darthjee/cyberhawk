# cyberhawk

This package adds several ready to use classes for an Angular2 project

## Usage

### controller

```javascript


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
