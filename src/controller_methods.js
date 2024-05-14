(function(_, local) {
  local.ControllerMethods = {
    construct(requesterBuilder, notifier, $location, $timeout, pagination, route) {
      this.requester = requesterBuilder.build($location);
      this.notifier = notifier;
      this.pagination = pagination;
      this.location = $location;
      this.$timeout = $timeout;
      this.routeParams = route.current.pathParams;
      this.route = route.current.$$route.route;

      this.constructor.extend(this.route, this);
      _.bindAll(this, "_setData", "save", "request", "_goIndex", "_error");
      this.requester.bind(this);
      this.request();
    },

    request() {
      var promise = this.requester.request();
      promise.then(this._setData);

      this.constructor.trigger(this, this.route, "request");
    },

    _setData(response) {
      this._setPagination(response);
      this.data = response.data;
      this.loaded = true;
      this.constructor.trigger(this, this.route, "loaded");
    },

    _setPagination(response) {
      if (this.pagination) {
        this.pagination.parse(response);
      }
    },

    save() {
      var promise = this.requester.saveRequest(this.payload());

      promise.then(this._setData);
      promise.then(this._goIndex);
      promise.error(this._error);
    },

    payload() {
      return this.data;
    },

    _error(data, responseStatus) {
      if(responseStatus === 422) {
        this.data = data;
      }
    },

    _goIndex() {
      this.location.path(this.location.$$path.replace(/\/(edit|new)$/, ""));
    },

    delete(id) {
      var promise = this.requester.deleteRequest(id);
      promise.then(this.request);
    }
  };
}(window._, local));
