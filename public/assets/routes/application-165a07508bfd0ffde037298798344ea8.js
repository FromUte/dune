(function() {
  Dashboard.AuthenticatedRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin);

  Dashboard.ApplicationRoute = Ember.Route.extend(SimpleAuth.ApplicationRouteMixin, {
    breadcrumbs: {
      name: 'Dashboard',
      icon: 'fa fa-home'
    },
    title: (function() {
      return Ember.I18n.t('titles.application');
    }).property(),
    renderTemplate: function() {
      return this.render('layouts/application');
    },
    actions: {
      loading: function() {
        var loading;
        loading = Dashboard.Loading.activate();
        this.router.one('didTransition', loading, 'deactivate');
        return true;
      },
      sessionAuthenticationFailed: function(error) {
        Bootstrap.NM.set('content', Ember.A());
        return Bootstrap.NM.push(Ember.I18n.t('sessions.new.invalid_password'), 'danger');
      },
      openModal: function(modal) {
        return this.render(modal, {
          into: 'layouts/application',
          outlet: 'modal',
          viewClass: 'modal'
        });
      },
      closeModal: function() {
        return this.disconnectOutlet({
          outlet: 'modal',
          parentView: 'layouts/application',
          viewClass: 'modal'
        });
      }
    }
  });

}).call(this);
