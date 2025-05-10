(function(_, local) {
  local.ControllerMethods = {
    construct(requesterBuilder, notifier, $location, $timeout, pagination, route) {
      this.requesterBuilder = requesterBuilder;
      this.notifier = notifier;
      this.pagination = pagination;
      this.location = $location;
      this.$timeout = $timeout;
      this.routeParams = route.current.pathParams;
      this.route = route.current.$$route.route;

      this.constructor.extend(this.route, this);
      this.bindMethods();
      this.request();
    },

    bindMethods() {
      _.bindAll(this, "_setData", "save", "request", "_goIndex", "_error", "_triggerSaved");
    },

    request() {
      var promise = this._getRequester().request();
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
      var promise = this._getRequester().saveRequest(this.payload());

      promise.then(this._setData);
      promise.then(this._triggerSaved);
      promise.then(this._goIndex);
      promise.error(this._error);
    },

    _triggerSaved() {
      this.constructor.trigger(this, this.route, "saved");
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
      this.location.path(this.path.replace(/\/(edit|new)$/, ""));
    },

    delete(id) {
      var promise = this.getRequester().deleteRequest(id);
      promise.then(this.request);
    },

    _getRequester() {
      if ( !this.requester ) {
        this._buildRequester();
      }

      return this.requester;
    },

    _buildRequester() {
      this.requester = this.requesterBuilder.build(this._requesterAttributes());
      this.requester.bind(this);
    },

    _requesterAttributes() {
      return {
        search: this.location.$$search,
        path: this._getPath()
      }
    },

    _getPath() {
      if ( this.path.constructor == String ) {
        return this.path;
      }

      return this.location.$$path;
    }
  };
}(window._, local));
