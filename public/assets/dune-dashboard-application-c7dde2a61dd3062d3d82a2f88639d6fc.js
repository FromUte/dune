(function() {
  var Dashboard;

  Dashboard = window.Dashboard = Ember.Application.create({
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: false
  });

  Ember.View.reopen(Em.I18n.TranslateableAttributes);

}).call(this);
(function() {
  Dashboard.ApplicationAdapter = DS.ActiveModelAdapter.extend({
    namespace: 'api'
  });

  Dashboard.ApplicationStore = DS.Store.extend({
    adapter: Dashboard.ApplicationAdapter.create()
  });

}).call(this);
(function() {
  window.ENV = window.ENV || {};

  window.ENV['simple-auth-devise'] = {
    serverTokenEndpoint: Dashboard.ApplicationAdapter.create().buildURL('sessions')
  };

  window.ENV['simple-auth'] = {
    authenticationRoute: 'sessionsNew',
    authorizer: 'authorizer:custom',
    store: 'simple-auth-session-store:local-storage'
  };

}).call(this);
(function() {
  Dashboard.FormDataAdapter = Dashboard.ApplicationAdapter.extend({
    ajaxOptions: function(url, type, hash) {
      var fd, headers, i, key, len, ref, root;
      hash = hash || {};
      hash.url = url;
      hash.type = type;
      hash.dataType = 'json';
      hash.context = this;
      if (hash.data && type !== 'GET' && type !== 'DELETE') {
        hash.processData = false;
        hash.contentType = false;
        fd = new FormData();
        root = Object.keys(hash.data)[0];
        ref = Object.keys(hash.data[root]);
        for (i = 0, len = ref.length; i < len; i++) {
          key = ref[i];
          if (hash.data[root][key]) {
            fd.append(root + "[" + key + "]", hash.data[root][key]);
          }
        }
        hash.data = fd;
      }
      headers = Ember.get(this, 'headers');
      if (headers !== void 0) {
        hash.beforeSend = function(xhr) {
          var j, len1, ref1, results;
          ref1 = Ember.keys(headers);
          results = [];
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            key = ref1[j];
            results.push(xhr.setRequestHeader(key, headers[key]));
          }
          return results;
        };
      }
      return hash;
    }
  });

}).call(this);
(function() {
  Dashboard.ChannelAdapter = Dashboard.FormDataAdapter.extend();

}).call(this);
(function() {
  Dashboard.PressAssetAdapter = Dashboard.FormDataAdapter.extend();

}).call(this);
(function() {
  Dashboard.CustomAuthenticator = SimpleAuth.Authenticators.Devise.extend({
    restore: function(properties) {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        if (!Ember.isEmpty(properties.access_token)) {
          resolve(properties);
        } else {
          reject();
        }
      });
    },
    authenticate: function(credentials) {
      var _this;
      _this = this;
      return new Ember.RSVP.Promise(function(resolve, reject) {
        var data;
        data = {
          email: credentials.identification,
          password: credentials.password
        };
        return _this.makeRequest(data).then((function(response) {
          return Ember.run(function() {
            return resolve(response);
          });
        }), function(xhr, status, error) {
          return Ember.run(function() {
            return reject(xhr.responseJSON || xhr.responseText);
          });
        });
      });
    }
  });

  Dashboard.CustomAuthorizer = SimpleAuth.Authorizers.Base.extend({
    authorize: function(jqXHR, requestOptions) {
      var accessToken;
      accessToken = this.get('session.access_token');
      if (this.get('session.isAuthenticated') && !Ember.isEmpty(accessToken)) {
        return jqXHR.setRequestHeader('Authorization', 'Token token=' + accessToken);
      }
    }
  });

  Ember.Application.initializer({
    name: 'authentication',
    before: 'simple-auth',
    initialize: function(container, application) {
      container.register('authenticator:custom', Dashboard.CustomAuthenticator);
      container.register('authorizer:custom', Dashboard.CustomAuthorizer);
      return SimpleAuth.Session.reopen({
        currentUser: (function() {
          var userId;
          userId = this.get('user_id');
          if (Ember.isEmpty(userId) && Ember.testing) {
            userId = 1;
          }
          if (!Ember.isEmpty(userId)) {
            return Ember.run(function() {
              return Dashboard.__container__.lookup('store:main').find('user', userId);
            });
          }
        }).property('user_id')
      });
    }
  });

}).call(this);
(function() {
  Dashboard.ChannelSerializer = DS.ActiveModelSerializer.extend(DS.EmbeddedRecordsMixin, {
    attrs: {
      user: {
        embedded: 'always'
      }
    },
    keyForRelationship: function(key, type) {
      if (this._super(key, type) === 'user') {
        return 'user_attributes';
      } else {
        return this._super(key, type);
      }
    }
  });

}).call(this);
(function() {
  Dashboard.FileTransform = DS.Transform.extend({
    serialize: function(deserialized) {
      if (Em.isNone(deserialized)) {
        return {};
      } else {
        return deserialized;
      }
    },
    deserialize: function(serialized) {
      if (Em.isNone(serialized)) {
        return {};
      } else {
        return serialized;
      }
    }
  });

}).call(this);
(function() {
  Dashboard.ObjectTransform = DS.Transform.extend({
    serialize: function(deserialized) {
      if (Em.isNone(deserialized)) {
        return {};
      } else {
        return deserialized;
      }
    },
    deserialize: function(serialized) {
      if (Em.isNone(serialized)) {
        return {};
      } else {
        return serialized;
      }
    }
  });

}).call(this);
(function() {
  Dashboard.ProjectSerializer = DS.ActiveModelSerializer.extend(DS.EmbeddedRecordsMixin, {
    attrs: {
      user: {
        embedded: 'always'
      }
    }
  });

}).call(this);
(function() {
  Dashboard.Channel = DS.Model.extend({
    user: DS.belongsTo('user'),
    name: DS.attr('string'),
    description: DS.attr('string'),
    permalink: DS.attr('string'),
    state: DS.attr('string'),
    created_at: DS.attr('date'),
    html_url: DS.attr('string'),
    video_url: DS.attr('string'),
    submit_your_project_text: DS.attr('string'),
    how_it_works: DS.attr('string'),
    accepts_projects: DS.attr('boolean'),
    image: DS.attr('file'),
    start_hero_image: DS.attr('file'),
    start_content: DS.attr('object'),
    success_content: DS.attr('object'),
    userEmail: DS.attr('string'),
    visible: (function() {
      if (this.get('state') === 'online') {
        return true;
      } else {
        return false;
      }
    }).property('state')
  });

}).call(this);
(function() {
  Dashboard.Contribution = DS.Model.extend({
    user: DS.belongsTo('user'),
    project: DS.belongsTo('project'),
    reward: DS.belongsTo('reward'),
    value: DS.attr('string'),
    anonymous: DS.attr('boolean'),
    state: DS.attr('string'),
    rights: DS.attr('object'),
    payment_method: DS.attr('string'),
    payment_service_fee: DS.attr('string'),
    payment_service_fee_paid_by_user: DS.attr('boolean'),
    payment_id: DS.attr('string'),
    key: DS.attr('string'),
    created_at: DS.attr('date'),
    confirmed_at: DS.attr('date')
  });

}).call(this);
(function() {
  Dashboard.PressAsset = DS.Model.extend({
    title: DS.attr('string'),
    image_url: DS.attr('string'),
    image: DS.attr('file'),
    url: DS.attr('string')
  });

}).call(this);
(function() {
  Dashboard.Project = DS.Model.extend({
    user: DS.belongsTo('user'),
    channel: DS.belongsTo('channel'),
    name: DS.attr('string'),
    permalink: DS.attr('string'),
    category: DS.attr('string'),
    goal: DS.attr('string'),
    pledged: DS.attr('string'),
    recommended: DS.attr('boolean'),
    featured: DS.attr('boolean'),
    home_page: DS.attr('boolean'),
    online_date: DS.attr('date'),
    expires_at: DS.attr('date'),
    state: DS.attr('string'),
    rights: DS.attr('object'),
    html_url: DS.attr('string')
  });

}).call(this);
(function() {
  Dashboard.Reward = DS.Model.extend({
    title: DS.attr('string'),
    minimum_value: DS.attr('string'),
    description: DS.attr('boolean')
  });

}).call(this);
(function() {
  Dashboard.Tag = DS.Model.extend({
    name: DS.attr('string'),
    visible: DS.attr('boolean', {
      defaultValue: false
    }),
    total_projects: DS.attr('number')
  });

}).call(this);
(function() {
  Dashboard.User = DS.Model.extend({
    name: DS.attr('string'),
    email: DS.attr('string'),
    image_url: DS.attr('string'),
    admin: DS.attr('boolean'),
    total_contributed: DS.attr('string'),
    profile_type: DS.attr('string'),
    html_url: DS.attr('string'),
    created_at: DS.attr('date'),
    edit_html_url: (function() {
      return (this.get('html_url')) + "/edit";
    }).property('html_url')
  });

}).call(this);
Ember.I18n.translations = {
  "channels.index.new": "Add New Channel",
  "channels.index.tabs.all": "All Channels",
  "channels.index.search.query": "Search",
  "channels.index.table.name": "Name",
  "channels.index.table.permalink": "Permalink",
  "channels.index.table.created_at": "Created at",
  "channels.index.table.state": "State",
  "channels.index.actions.push_to_draft": "Send to Draft",
  "channels.index.actions.push_to_online": "Send to Online",
  "channels.form.associate_existing_user": "Associate an existing user",
  "channels.form.create_new_channel_user": "Create a new user",
  "channels.form.start_content_fieldset": "Content for Start Page",
  "channels.form.success_content_fieldset": "Content for Successfully Submitted Page",
  "channels.form.permalink": "Permalink",
  "channels.form.name": "Name",
  "channels.form.accepts_projects": "Accepts Projects",
  "channels.form.description": "Description",
  "channels.form.image": "Image",
  "channels.form.email": "Email",
  "channels.form.video_url": "Video Url",
  "channels.form.how_it_works": "About Us",
  "channels.form.submit_your_project_text": "Submit Your Project",
  "channels.form.start_hero_image": "Header Image",
  "channels.form.start_content.start_primary_content": "Primary Content",
  "channels.form.start_content.start_secondary_content": "Secondary Content",
  "channels.form.start_content.title": "Title",
  "channels.form.start_content.subtitle": "Subtitle",
  "channels.form.start_content.first_step_icon": "First Step Icon",
  "channels.form.start_content.first_step_title": "First Step Title",
  "channels.form.start_content.first_step_description": "First Step Description",
  "channels.form.start_content.second_step_icon": "Second Step Icon",
  "channels.form.start_content.second_step_title": "Second Step Title",
  "channels.form.start_content.second_step_description": "Second Description",
  "channels.form.start_content.third_step_icon": "Third Step Icon",
  "channels.form.start_content.third_step_title": "Third Step Title",
  "channels.form.start_content.third_step_description": "Third Step Description",
  "channels.form.success_content.main_text": "Main Text",
  "channels.form.success_content.button_text": "Button Text",
  "channels.form.success_content.button_link": "Button Link",
  "contributions.index.tabs.pending": "Pending",
  "contributions.index.tabs.waiting_confirmation": "Waiting Confirmation",
  "contributions.index.tabs.confirmed": "Confirmed",
  "contributions.index.tabs.canceled": "Canceled",
  "contributions.index.tabs.refunded": "Refunded",
  "contributions.index.tabs.requested_refund": "Requested Refund",
  "contributions.index.tabs.refunded_and_canceled": "Refunded and Canceled",
  "contributions.index.search.query": "Search",
  "contributions.index.search.between_values": "Between Values",
  "contributions.index.table.project": "Project",
  "contributions.index.table.user": "User",
  "contributions.index.table.user_email": "User Email",
  "contributions.index.table.value": "Value",
  "contributions.index.table.anonymous": "Anonymous",
  "contributions.index.table.state": "State",
  "contributions.index.actions.confirm": "Confirm",
  "contributions.index.actions.refund": "Refund",
  "contributions.index.actions.hide": "Hide",
  "contributions.index.actions.cancel": "Cancel",
  "contributions.index.actions.pendent": "Set as Pending",
  "contributions.index.actions.push_to_trash": "Destroy",
  "contributions.show.contribution_to": "'s contribution to",
  "contributions.show.value": "Value",
  "contributions.show.payment_method": "Payment Method",
  "contributions.show.payment_service_fee": "Payment Fee",
  "contributions.show.payment_service_fee_paid_by_user": "Payment Fee Paid by User?",
  "contributions.show.payment_id": "Payment ID",
  "contributions.show.key": "Contribution Key",
  "contributions.show.user_email": "User Email",
  "contributions.show.created_at": "Created at",
  "contributions.show.confirmed_at": "Confirmed at",
  "contributions.show.reward.title": "Reward Title",
  "contributions.show.reward.minimum_value": "Reward Value",
  "layouts.sidebar.dashboard": "Dashboard",
  "layouts.sidebar.projects": "Projects",
  "layouts.sidebar.contributions": "Contributions",
  "layouts.sidebar.users": "Users",
  "layouts.sidebar.channels": "Channels",
  "layouts.sidebar.tags": "Tags",
  "layouts.sidebar.press_assets": "Press Assets",
  "layouts.sidebar.contacts": "Contacts",
  "layouts.sidebar.reports": "Reports",
  "layouts.sidebar.financial": "Financial",
  "layouts.header.profile": "Profile",
  "layouts.header.sign_out": "Sign out",
  "press_assets.form.title": "Title",
  "press_assets.form.url": "Url",
  "press_assets.form.image": "Image",
  "press_assets.index.new": "Add a new Press Asset",
  "press_assets.index.tabs.all": "All Press Assets",
  "press_assets.index.table.title": "Title",
  "press_assets.index.table.url": "Url",
  "press_assets.index.table.image": "Image",
  "projects.index.tabs.online": "Online",
  "projects.index.tabs.soon": "Soon",
  "projects.index.tabs.draft": "Draft",
  "projects.index.tabs.rejected": "Rejected",
  "projects.index.tabs.successful": "Successful",
  "projects.index.tabs.failed": "Failed",
  "projects.index.tabs.waiting_funds": "Waiting Funds",
  "projects.index.table.name": "Name",
  "projects.index.table.user": "User",
  "projects.index.table.goal": "Goal",
  "projects.index.table.pledged": "Pledged",
  "projects.index.table.expires_at": "Expires at",
  "projects.index.table.state": "State",
  "projects.index.table.recommended": "Recommended - ",
  "projects.index.table.featured": "Featured - ",
  "projects.index.table.home_page": "Home Page - ",
  "projects.index.actions.approve": "Approve!",
  "projects.index.actions.launch": "Launch!",
  "projects.index.actions.reject": "Reject!",
  "projects.index.actions.push_to_draft": "Sent to Draft!",
  "projects.index.actions.push_to_trash": "Sent to Trash!",
  "projects.index.actions.are_you_sure_to_launch": "Are you sure you want to launch this project?",
  "projects.index.search.query": "Search",
  "projects.index.search.between_created_at": "Creation Date",
  "projects.index.search.between_expires_at": "Expiration Date",
  "projects.index.search.between_online_date": "Active Date",
  "sessions.new.title": "Sign In",
  "sessions.new.submit": "Sign me in",
  "sessions.new.email": "Email",
  "sessions.new.password": "Password",
  "sessions.new.sign-up": "Not in the neighborhood yet?",
  "sessions.new.forget_password": "Did you forget your password?",
  "sessions.new.invalid_password": "Invalid email or password.",
  "tags.form.name": "Name",
  "tags.form.visible": "Visible",
  "tags.index.new": "Add a new Tag",
  "tags.index.popular": "Popular Tags",
  "tags.index.all": "All Tags",
  "tags.index.name": "Name",
  "tags.index.visible": "Visible",
  "tags.index.total_projects": "Total Projects",
  "titles.application": "dune-investissement",
  "titles.index": "Dashboard",
  "titles.projects.index": "Projects",
  "titles.tags.new": "New Tag",
  "titles.tags.index": "Tags",
  "titles.tags.edit": "Edit Tag",
  "titles.press_assets.new": "New Press Asset",
  "titles.press_assets.index": "Press Assets",
  "titles.press_assets.edit": "Edit Press Asset",
  "titles.users.index": "Users",
  "titles.contributions.index": "Contributions",
  "titles.channels.index": "Channels",
  "titles.channels.new": "Add New Channel",
  "titles.channels.edit": "Edit Channel",
  "users.index.search.query": "Search",
  "users.index.tabs.all": "All Users",
  "users.index.table.name": "Name",
  "users.index.table.email": "Email",
  "users.index.table.total_contributed": "Total Contributed",
  "users.index.table.created_at": "Created at",
  "words.are_you_sure_to_delete": "Are you sure you want to delete this item?",
  "words.no_results": "No results",
  "words.save": "Save",
  "words.cancel": "Cancel",
  "words._yes": "Yes",
  "words._no": "No",
  "words.search": "Submit Search",
  "words.search_results": "Search Results",
  "words.close": "Close",
  "words.okay": "Okay"
};
Ember.I18n.translations = {
  "channels.index.new": "Add New Channel",
  "channels.index.tabs.all": "All Channels",
  "channels.index.search.query": "Search",
  "channels.index.table.name": "Name",
  "channels.index.table.permalink": "Permalink",
  "channels.index.table.created_at": "Created at",
  "channels.index.table.state": "State",
  "channels.index.actions.push_to_draft": "Send to Draft",
  "channels.index.actions.push_to_online": "Send to Online",
  "channels.form.associate_existing_user": "Associate an existing user",
  "channels.form.create_new_channel_user": "Create a new user",
  "channels.form.start_content_fieldset": "Content for Start Page",
  "channels.form.success_content_fieldset": "Content for Successfully Submitted Page",
  "channels.form.permalink": "Permalink",
  "channels.form.name": "Name",
  "channels.form.accepts_projects": "Accepts Projects",
  "channels.form.description": "Description",
  "channels.form.image": "Image",
  "channels.form.email": "Email",
  "channels.form.video_url": "Video Url",
  "channels.form.how_it_works": "About Us",
  "channels.form.submit_your_project_text": "Submit Your Project",
  "channels.form.start_hero_image": "Header Image",
  "channels.form.start_content.start_primary_content": "Primary Content",
  "channels.form.start_content.start_secondary_content": "Secondary Content",
  "channels.form.start_content.title": "Title",
  "channels.form.start_content.subtitle": "Subtitle",
  "channels.form.start_content.first_step_icon": "First Step Icon",
  "channels.form.start_content.first_step_title": "First Step Title",
  "channels.form.start_content.first_step_description": "First Step Description",
  "channels.form.start_content.second_step_icon": "Second Step Icon",
  "channels.form.start_content.second_step_title": "Second Step Title",
  "channels.form.start_content.second_step_description": "Second Description",
  "channels.form.start_content.third_step_icon": "Third Step Icon",
  "channels.form.start_content.third_step_title": "Third Step Title",
  "channels.form.start_content.third_step_description": "Third Step Description",
  "channels.form.success_content.main_text": "Main Text",
  "channels.form.success_content.button_text": "Button Text",
  "channels.form.success_content.button_link": "Button Link",
  "contributions.index.tabs.pending": "Pending",
  "contributions.index.tabs.waiting_confirmation": "Waiting Confirmation",
  "contributions.index.tabs.confirmed": "Confirmed",
  "contributions.index.tabs.canceled": "Canceled",
  "contributions.index.tabs.refunded": "Refunded",
  "contributions.index.tabs.requested_refund": "Requested Refund",
  "contributions.index.tabs.refunded_and_canceled": "Refunded and Canceled",
  "contributions.index.search.query": "Search",
  "contributions.index.search.between_values": "Between Values",
  "contributions.index.table.project": "Project",
  "contributions.index.table.user": "User",
  "contributions.index.table.user_email": "User Email",
  "contributions.index.table.value": "Value",
  "contributions.index.table.anonymous": "Anonymous",
  "contributions.index.table.state": "State",
  "contributions.index.actions.confirm": "Confirm",
  "contributions.index.actions.refund": "Refund",
  "contributions.index.actions.hide": "Hide",
  "contributions.index.actions.cancel": "Cancel",
  "contributions.index.actions.pendent": "Set as Pending",
  "contributions.index.actions.push_to_trash": "Destroy",
  "contributions.show.contribution_to": "'s contribution to",
  "contributions.show.value": "Value",
  "contributions.show.payment_method": "Payment Method",
  "contributions.show.payment_service_fee": "Payment Fee",
  "contributions.show.payment_service_fee_paid_by_user": "Payment Fee Paid by User?",
  "contributions.show.payment_id": "Payment ID",
  "contributions.show.key": "Contribution Key",
  "contributions.show.user_email": "User Email",
  "contributions.show.created_at": "Created at",
  "contributions.show.confirmed_at": "Confirmed at",
  "contributions.show.reward.title": "Reward Title",
  "contributions.show.reward.minimum_value": "Reward Value",
  "layouts.sidebar.dashboard": "Dashboard",
  "layouts.sidebar.projects": "Projects",
  "layouts.sidebar.contributions": "Contributions",
  "layouts.sidebar.users": "Users",
  "layouts.sidebar.channels": "Channels",
  "layouts.sidebar.tags": "Tags",
  "layouts.sidebar.press_assets": "Press Assets",
  "layouts.sidebar.contacts": "Contacts",
  "layouts.sidebar.reports": "Reports",
  "layouts.sidebar.financial": "Financial",
  "layouts.header.profile": "Profile",
  "layouts.header.sign_out": "Sign out",
  "press_assets.form.title": "Title",
  "press_assets.form.url": "Url",
  "press_assets.form.image": "Image",
  "press_assets.index.new": "Add a new Press Asset",
  "press_assets.index.tabs.all": "All Press Assets",
  "press_assets.index.table.title": "Title",
  "press_assets.index.table.url": "Url",
  "press_assets.index.table.image": "Image",
  "projects.index.tabs.online": "Online",
  "projects.index.tabs.soon": "Soon",
  "projects.index.tabs.draft": "Draft",
  "projects.index.tabs.rejected": "Rejected",
  "projects.index.tabs.successful": "Successful",
  "projects.index.tabs.failed": "Failed",
  "projects.index.tabs.waiting_funds": "Waiting Funds",
  "projects.index.table.name": "Name",
  "projects.index.table.user": "User",
  "projects.index.table.goal": "Goal",
  "projects.index.table.pledged": "Pledged",
  "projects.index.table.expires_at": "Expires at",
  "projects.index.table.state": "State",
  "projects.index.table.recommended": "Recommended - ",
  "projects.index.table.featured": "Featured - ",
  "projects.index.table.home_page": "Home Page - ",
  "projects.index.actions.approve": "Approve!",
  "projects.index.actions.launch": "Launch!",
  "projects.index.actions.reject": "Reject!",
  "projects.index.actions.push_to_draft": "Sent to Draft!",
  "projects.index.actions.push_to_trash": "Sent to Trash!",
  "projects.index.actions.are_you_sure_to_launch": "Are you sure you want to launch this project?",
  "projects.index.search.query": "Search",
  "projects.index.search.between_created_at": "Creation Date",
  "projects.index.search.between_expires_at": "Expiration Date",
  "projects.index.search.between_online_date": "Active Date",
  "sessions.new.title": "Sign In",
  "sessions.new.submit": "Sign me in",
  "sessions.new.email": "Email",
  "sessions.new.password": "Password",
  "sessions.new.sign-up": "Not in the neighborhood yet?",
  "sessions.new.forget_password": "Did you forget your password?",
  "sessions.new.invalid_password": "Invalid email or password.",
  "tags.form.name": "Name",
  "tags.form.visible": "Visible",
  "tags.index.new": "Add a new Tag",
  "tags.index.popular": "Popular Tags",
  "tags.index.all": "All Tags",
  "tags.index.name": "Name",
  "tags.index.visible": "Visible",
  "tags.index.total_projects": "Total Projects",
  "titles.application": "dune-investissement",
  "titles.index": "Dashboard",
  "titles.projects.index": "Projects",
  "titles.tags.new": "New Tag",
  "titles.tags.index": "Tags",
  "titles.tags.edit": "Edit Tag",
  "titles.press_assets.new": "New Press Asset",
  "titles.press_assets.index": "Press Assets",
  "titles.press_assets.edit": "Edit Press Asset",
  "titles.users.index": "Users",
  "titles.contributions.index": "Contributions",
  "titles.channels.index": "Channels",
  "titles.channels.new": "Add New Channel",
  "titles.channels.edit": "Edit Channel",
  "users.index.search.query": "Search",
  "users.index.tabs.all": "All Users",
  "users.index.table.name": "Name",
  "users.index.table.email": "Email",
  "users.index.table.total_contributed": "Total Contributed",
  "users.index.table.created_at": "Created at",
  "words.are_you_sure_to_delete": "Are you sure you want to delete this item?",
  "words.no_results": "No results",
  "words.save": "Save",
  "words.cancel": "Cancel",
  "words._yes": "Yes",
  "words._no": "No",
  "words.search": "Submit Search",
  "words.search_results": "Search Results",
  "words.close": "Close",
  "words.okay": "Okay"
};
(function() {
  Dashboard.ModalControllerMixin = Ember.Mixin.create({
    actions: {
      cancel: function() {
        return this.send('closeModal');
      },
      close: function() {
        return this.send('closeModal');
      }
    }
  });

}).call(this);
(function() {
  Dashboard.ModalViewMixin = Ember.Mixin.create({
    tagName: 'div',
    classNames: 'modal',
    didInsertElement: function() {
      this.$().attr('id', 'modal');
      this.$().modal({
        keyboard: false,
        backdrop: 'static'
      });
      return this.$().modal('show');
    },
    willDestroyElement: function() {
      return this.$().modal('hide');
    }
  });

}).call(this);
(function() {
  Dashboard.PaginableControllerMixin = Ember.Mixin.create({
    actions: {
      refreshPageData: function(page) {
        var query;
        query = $.extend(this.get('model')['query'], {
          page: page
        });
        return this.store.findQuery(this.get('model').type, query).then((function(_this) {
          return function(records) {
            return _this.set('model', records);
          };
        })(this));
      },
      gotoPage: function(page) {
        return this.send('refreshPageData', page);
      },
      nextPage: function() {
        var current;
        current = this.get('model.meta.page') || 1;
        if (!(current + 1 > this.get('model.meta.total_pages'))) {
          return this.send('gotoPage', current + 1);
        }
      },
      previousPage: function() {
        var current;
        current = this.get('model.meta.page') || 2;
        return this.send('gotoPage', current - 1);
      },
      lastPage: function() {
        var last;
        last = this.get('model.meta.total_pages') || 1;
        return this.send('gotoPage', last);
      },
      firstPage: function() {
        return this.send('gotoPage', 1);
      }
    }
  });

}).call(this);
(function() {
  Dashboard.SearchableRoute = Ember.Mixin.create({
    baseRouteName: null,
    resourceName: null,
    queryParams: null,
    setupController: function(controller, model) {
      this._super(controller, model);
      if (this.queryParams) {
        controller.set('search', $.deparam(this.queryParams));
        return Dashboard.__container__.lookup("controller:" + this.baseRouteName + "Tab").set('search', controller.get('search'));
      }
    },
    model: function(params) {
      var filter, search;
      search = this.get('controller.search');
      if (search) {
        filter = search;
        this.queryParams = null;
      } else if (params.query) {
        this.queryParams = params.query;
        filter = params.query;
      }
      return this.store.findQuery(this.resourceName, filter);
    }
  });

  Dashboard.SearchableBaseController = Ember.Mixin.create({
    defaultSearchFields: {},
    baseRouteName: null,
    searchRouteParams: null,
    search: (function() {
      return Ember.copy(this.get('defaultSearchFields'), true);
    }).property('defaultSearchFields'),
    updateSearchRouteParams: (function() {
      this.getController('Search').set('searchRouteParams', $.param(this.get('search')));
      return this.getController('Tab').set('searchRouteParams', $.param(this.get('search')));
    }).observes('search'),
    actions: {
      submitSearch: function() {
        this.updateSearchRouteParams();
        this.getController('Search').set('search', this.get('search'));
        return this.transitionToRoute(this.baseRouteName + ".search", $.param(this.get('search')));
      },
      closeSearch: function() {
        this.getController('Search').set('search', Ember.copy(this.get('defaultSearchFields'), true));
        this.getController('Tab').set('search', Ember.copy(this.get('defaultSearchFields'), true));
        if (this.constructor.toString().match((this.baseRouteName.capitalize()) + "SearchController")) {
          return this.transitionToRoute("" + this.baseRouteName);
        }
      }
    },
    getController: function(name) {
      return Dashboard.__container__.lookup("controller:" + this.baseRouteName + name);
    }
  });

  Dashboard.SearchableController = Ember.Mixin.create({
    baseRouteName: null,
    actions: {
      submitSearch: function() {
        this._super();
        return Dashboard.__container__.lookup("controller:" + this.baseRouteName + "Tab").set('search', this.get('search'));
      }
    }
  });

}).call(this);
(function() {
  Dashboard.ChannelsTabController = Ember.ArrayController.extend(Dashboard.SearchableBaseController, Dashboard.PaginableControllerMixin, {
    baseRouteName: 'channels',
    defaultSearchFields: {
      query: null
    },
    actions: {
      changeState: function(channel, action) {
        var channelUrl;
        channelUrl = Dashboard.ApplicationAdapter.prototype.buildURL('channels', channel.id);
        $.ajax({
          url: channelUrl + "/" + action,
          type: 'PUT'
        });
        return this.get('target').send('refresh');
      },
      destroy: function(channel) {
        if (window.confirm(Ember.I18n.t('words.are_you_sure_to_delete'))) {
          channel.destroyRecord();
          return this.removeObjects(channel);
        }
      }
    }
  });

  Dashboard.ChannelsSearchController = Dashboard.ChannelsTabController.extend(Dashboard.SearchableController, {
    baseRouteName: 'channels'
  });

  Dashboard.ChannelsEditController = Ember.ObjectController.extend({
    actions: {
      save: function() {
        var channel;
        channel = this.get('model');
        return channel.save().then((function(_this) {
          return function() {
            return _this.transitionToRoute('channels');
          };
        })(this))["catch"](function(errors) {
          return console.log(errors);
        });
      },
      cancel: function() {
        return this.transitionToRoute('channels');
      }
    }
  });

  Dashboard.ChannelsNewController = Dashboard.ChannelsEditController.extend();

}).call(this);
(function() {
  Dashboard.ContributionsTabController = Ember.ArrayController.extend(Dashboard.SearchableBaseController, Dashboard.PaginableControllerMixin, {
    baseRouteName: 'contributions',
    defaultSearchFields: {
      query: null,
      between_values: {
        initial: null,
        final: null
      }
    },
    actions: {
      changeState: function(contribution, action) {
        var contributionUrl;
        contributionUrl = Dashboard.ApplicationAdapter.prototype.buildURL('contributions', contribution.id);
        $.ajax({
          url: contributionUrl + "/" + action,
          type: 'PUT'
        });
        return this.get('target').send('refresh');
      },
      destroy: function(contribution) {
        if (window.confirm(Ember.I18n.t('words.are_you_sure_to_delete'))) {
          contribution.destroyRecord();
          return this.removeObjects(contribution);
        }
      }
    }
  });

  Dashboard.ContributionsSearchController = Dashboard.ContributionsTabController.extend(Dashboard.SearchableController, {
    baseRouteName: 'contributions'
  });

  Dashboard.ContributionsShowController = Ember.ObjectController.extend(Dashboard.ModalControllerMixin);

}).call(this);
(function() {
  Dashboard.PressAssetsIndexController = Ember.ArrayController.extend(Dashboard.PaginableControllerMixin, {
    actions: {
      destroy: function(item) {
        if (window.confirm(Ember.I18n.t('words.are_you_sure_to_delete'))) {
          item.destroyRecord();
          return this.removeObjects(item);
        }
      }
    }
  });

  Dashboard.PressAssetsEditController = Ember.ObjectController.extend({
    actions: {
      save: function() {
        var press_asset;
        press_asset = this.get('model');
        return press_asset.save().then((function(_this) {
          return function() {
            return _this.transitionToRoute('press_assets');
          };
        })(this))["catch"](function() {});
      },
      cancel: function() {
        return this.transitionToRoute('press_assets');
      }
    }
  });

  Dashboard.PressAssetsNewController = Dashboard.PressAssetsEditController.extend();

}).call(this);
(function() {
  Dashboard.ProjectsTabController = Ember.ArrayController.extend(Dashboard.SearchableBaseController, Dashboard.PaginableControllerMixin, {
    baseRouteName: 'projects',
    defaultSearchFields: {
      query: null,
      manageable: true,
      between_created_at: {
        starts_at: null,
        ends_at: null
      },
      between_expires_at: {
        starts_at: null,
        ends_at: null
      },
      between_online_date: {
        starts_at: null,
        ends_at: null
      }
    },
    actions: {
      launch: function(project) {
        if (window.confirm(Ember.I18n.t('projects.index.actions.are_you_sure_to_launch'))) {
          return this.send('changeState', project, 'launch');
        }
      },
      changeState: function(project, action) {
        var projectUrl;
        projectUrl = Dashboard.ApplicationAdapter.prototype.buildURL('projects', project.id);
        $.ajax({
          url: projectUrl + "/" + action,
          type: 'PUT'
        });
        return this.get('target').send('refresh');
      },
      destroy: function(project) {
        if (window.confirm(Ember.I18n.t('words.are_you_sure_to_delete'))) {
          project.destroyRecord();
          return this.removeObjects(project);
        }
      }
    }
  });

  Dashboard.ProjectsSearchController = Dashboard.ProjectsTabController.extend(Dashboard.SearchableController, {
    baseRouteName: 'projects'
  });

}).call(this);
(function() {
  Dashboard.SessionsNewController = Ember.Controller.extend(SimpleAuth.LoginControllerMixin, {
    authenticator: 'authenticator:custom'
  });

}).call(this);
(function() {
  Dashboard.TagsTabController = Ember.ArrayController.extend(Dashboard.PaginableControllerMixin, {
    actions: {
      destroy: function(item) {
        if (window.confirm(Ember.I18n.t('words.are_you_sure_to_delete'))) {
          item.destroyRecord();
          return this.removeObjects(item);
        }
      }
    }
  });

  Dashboard.TagsEditController = Ember.ObjectController.extend({
    actions: {
      save: function() {
        var tag;
        tag = this.get('model');
        return tag.save().then((function(_this) {
          return function() {
            return _this.transitionToRoute('tags');
          };
        })(this))["catch"](function() {});
      },
      cancel: function() {
        return this.transitionToRoute('tags');
      }
    }
  });

  Dashboard.TagsNewController = Dashboard.TagsEditController.extend();

}).call(this);
(function() {
  Dashboard.UsersTabController = Ember.ArrayController.extend(Dashboard.SearchableBaseController, Dashboard.PaginableControllerMixin, {
    baseRouteName: 'users',
    defaultSearchFields: {
      query: null
    }
  });

  Dashboard.UsersSearchController = Dashboard.UsersTabController.extend(Dashboard.SearchableController, {
    baseRouteName: 'users'
  });

}).call(this);
(function() {
  Dashboard.AutoSaveCheckboxView = Ember.View.extend({
    template: Ember.Handlebars.compile("{{input type='checkbox' checked=view.attr}}"),
    tagName: 'span',
    attributeBindings: ['attr', 'resource'],
    didInsertElement: function() {
      var self;
      self = this;
      return this.$('input').on('change', function() {
        self.set('attr', $(this).is(':checked'));
        return self.get('resource').save();
      });
    }
  });

}).call(this);
(function() {
  Dashboard.ContributionsShowView = Ember.View.extend(Dashboard.ModalViewMixin);

}).call(this);
(function() {
  Dashboard.DaterangepickerView = Ember.View.extend(Em.I18n.TranslateableProperties, {
    templateName: 'daterangepicker',
    classNames: ['form-group'],
    attributeBindings: ['start', 'end'],
    start: null,
    end: null,
    format: 'MMMM D, YYYY',
    serverFormat: 'YYYY-MM-DD',
    didInsertElement: function() {
      var format, visibleDate;
      format = this.get('format');
      this.$('.daterangepicker-input').daterangepicker({
        locale: {
          cancelLabel: 'Clear'
        },
        format: format,
        startDate: this.get('start'),
        endDate: this.get('end'),
        ranges: {
          Today: [moment(), moment()],
          Yesterday: [moment().subtract('days', 1), moment().subtract('days', 1)],
          'Last 7 Days': [moment().subtract('days', 6), moment()],
          'Last 30 Days': [moment().subtract('days', 29), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
        }
      }, (function(_this) {
        return function(start, end) {
          _this.set('start', start.format(_this.get('serverFormat')));
          return _this.set('end', end.format(_this.get('serverFormat')));
        };
      })(this));
      this.$('.daterangepicker-input').on('cancel.daterangepicker', (function(_this) {
        return function(ev, picker) {
          _this.$('.daterangepicker-input').val('');
          _this.set('start', '');
          return _this.set('end', '');
        };
      })(this));
      this.$('.daterangepicker-input').on('show.daterangepicker', (function(_this) {
        return function(ev, picker) {
          if (Ember.isEmpty(_this.get('start')) && Ember.isEmpty(_this.get('end'))) {
            picker.setStartDate(moment());
            return picker.setEndDate(moment());
          }
        };
      })(this));
      if (!Ember.isEmpty(this.get('start')) && !Ember.isEmpty(this.get('end'))) {
        visibleDate = (moment(this.get('start')).format(format)) + " - " + (moment(this.get('end')).format(format));
        return this.$('.daterangepicker-input').attr('value', visibleDate);
      }
    }
  });

}).call(this);
(function() {
  Dashboard.FileView = Ember.View.extend({
    tagName: 'input',
    attributeBindings: ['type', 'id'],
    type: 'file',
    change: function(e) {
      return this.set('file', e.target.files[0]);
    }
  });

}).call(this);
(function() {
  Dashboard.reopen({
    HeaderView: Ember.View.extend({
      templateName: 'layouts/header',
      didInsertElement: function() {
        $('.dropdown-toggle').dropdown();
        return $("[data-toggle='offcanvas']").click(function(e) {
          e.preventDefault();
          if ($(window).width() <= 992) {
            $(".row-offcanvas").toggleClass("active");
            $(".left-side").removeClass("collapse-left");
            $(".right-side").removeClass("strech");
            $(".row-offcanvas").toggleClass("relative");
          } else {
            $(".left-side").toggleClass("collapse-left");
            $(".right-side").toggleClass("strech");
          }
        });
      }
    })
  });

}).call(this);
(function() {
  Dashboard.reopen({
    SidebarView: Ember.View.extend({
      templateName: 'layouts/sidebar',
      didInsertElement: function() {
        return $(".sidebar .treeview").tree();
      }
    })
  });

}).call(this);
(function() {
  Dashboard.PageTitle = Ember.View.extend({
    tagName: 'h1',
    content: [],
    template: Ember.Handlebars.compile('{{view.content}}'),
    router: Ember.computed('controller', function() {
      return this.get('controller').container.lookup('router:main');
    }),
    currentPathObserver: (function() {
      this.get('router');
      return this.send('updateTitleByRoute');
    }).observes('router.url').on('init'),
    actions: {
      updateTitleByRoute: function() {
        var appTitle, content, currentRoute, routes;
        content = [];
        routes = this.get('container').lookup('router:main');
        appTitle = this.appTitle(routes);
        if (appTitle) {
          content.pushObject(appTitle);
        }
        currentRoute = routes.get('router.currentHandlerInfos').slice(-1)[0];
        if (currentRoute.handler.get('title')) {
          content.pushObject(currentRoute.handler.get('title'));
        }
        content.reverse();
        this.setDocumentTittle(content.join(' - '));
        content.pop();
        this.set('content', content.join(' - '));
        return this.rerender();
      }
    },
    setDocumentTittle: function(content) {
      return $('title').html(content);
    },
    appTitle: function(routes) {
      var title;
      title = false;
      routes.get('router.currentHandlerInfos').forEach(function(route) {
        if (route.handler.routeName === 'application' && route.handler.get('title')) {
          return title = route.handler.get('title');
        }
      });
      return title;
    }
  });

  Ember.Handlebars.helper('page-title', Dashboard.PageTitle);

}).call(this);
(function() {
  Dashboard.PaginationView = Ember.View.extend({
    tagName: 'div',
    classNames: ['pagination-right'],
    templateName: 'pagination',
    current: (function() {
      return this.get('controller.model.meta.page');
    }).property('controller.model.meta.page'),
    totalPages: (function() {
      return this.get('controller.model.meta.total_pages');
    }).property('controller.model.meta.total_pages'),
    isFirst: (function() {
      return this.get('current') === 1;
    }).property('current'),
    isLast: (function() {
      return this.get('current') === this.get('totalPages');
    }).property('current', 'totalPages'),
    pages: (function() {
      var current, i, items, result, totalPages;
      totalPages = this.get('totalPages');
      current = this.get('current');
      items = (function() {
        var j, results;
        if (totalPages < 9) {
          return (function() {
            results = [];
            for (var j = 1; 1 <= totalPages ? j <= totalPages : j >= totalPages; 1 <= totalPages ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this);
        } else {
          switch (current) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
              return [1, 2, 3, 4, 5, 6, '…', totalPages - 1, totalPages];
            case totalPages - 4:
            case totalPages - 3:
            case totalPages - 2:
            case totalPages - 1:
            case totalPages:
              return [1, 2, '…', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            default:
              return [1, 2, '…', current - 1, current, current + 1, '…', totalPages - 1, totalPages];
          }
        }
      })();
      result = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = items.length; j < len; j++) {
          i = items[j];
          if (i === '…') {
            results.push({
              value: '…',
              disabled: true
            });
          } else {
            results.push({
              page: i,
              value: i,
              active: i === current
            });
          }
        }
        return results;
      })();
      return result;
    }).property('totalPages', 'current')
  });

}).call(this);
(function() {
  Dashboard.ProjectsIndexView = Ember.View.extend({
    templateName: 'projects/index',
    didInsertElement: function() {
      return $('.dropdown-toggle').dropdown();
    }
  });

}).call(this);
(function() {
  Dashboard.SearchTab = Ember.View.extend({
    type: 'view',
    templateName: 'search-tab',
    routeName: '',
    tagName: '',
    routeParams: (function() {
      return this.get('controller.searchRouteParams');
    }).property('controller.searchRouteParams'),
    hasSearch: (function() {
      var hasValues;
      hasValues = function(values) {
        var results;
        results = [];
        $.map(values, (function(_this) {
          return function(value) {
            if (Ember.typeOf(value) === 'object') {
              return results.push(hasValues(value));
            } else if (!Ember.isEmpty(value)) {
              return results.push(true);
            }
          };
        })(this));
        return [].concat.apply([], results);
      };
      return $.inArray(true, hasValues(this.get('controller.search'))) !== -1;
    }).property('controller.search')
  });

}).call(this);
Ember.TEMPLATES["channels/_form"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("<div class=\"row\"><div class=\"col-xs-6\"><h4>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.associate_existing_user", options) : helperMissing.call(depth0, "t", "channels.form.associate_existing_user", options))));
  data.buffer.push("</h4><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.user_id:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.user_id", options) : helperMissing.call(depth0, "t", "channels.form.user_id", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("number"),
    'value': ("user_id"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  stack1 = helpers.each.call(depth0, "errors.user_id", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div><div class=\"col-xs-6\"><h4>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.create_new_channel_user", options) : helperMissing.call(depth0, "t", "channels.form.create_new_channel_user", options))));
  data.buffer.push("</h4><div class=\"row\"><div class=\"col-xs-6\"><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.userEmail:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.email", options) : helperMissing.call(depth0, "t", "channels.form.email", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("user.email"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  stack1 = helpers.each.call(depth0, "errors.userEmail", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div><div class=\"col-xs-6\"><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.userPassword:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.user.password", options) : helperMissing.call(depth0, "t", "channels.form.user.password", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("password"),
    'value': ("user.password"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  stack1 = helpers.each.call(depth0, "errors.userPassword", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div></div></div></div>");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<span class=\"error\">");
  stack1 = helpers._triageMustache.call(depth0, "message", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("<div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.userEmail:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.email", options) : helperMissing.call(depth0, "t", "channels.form.email", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("user.email"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  stack1 = helpers.each.call(depth0, "errors.userEmail", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  }

  data.buffer.push("<form ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {hash:{
    'on': ("submit")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" enctype=\"multipart/form-data\">");
  stack1 = helpers.unless.call(depth0, "user.id", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<div class=\"row\"><div class=\"col-xs-3\"><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.permalink:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.permalink", options) : helperMissing.call(depth0, "t", "channels.form.permalink", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("permalink"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  stack1 = helpers.each.call(depth0, "errors.permalink", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div><div class=\"col-xs-7\"><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.name:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.name", options) : helperMissing.call(depth0, "t", "channels.form.name", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("name"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  stack1 = helpers.each.call(depth0, "errors.name", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div><div class=\"col-xs-2\"><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.accepts_projects:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.accepts_projects", options) : helperMissing.call(depth0, "t", "channels.form.accepts_projects", options))));
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("accepts_projects"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'checked': "ID",'class': "STRING"},hashContexts:{'type': depth0,'checked': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</label></div></div></div><div class=\"row\"><div class=\"col-xs-9\"><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.description:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.description", options) : helperMissing.call(depth0, "t", "channels.form.description", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea),options={hash:{
    'value': ("description"),
    'class': ("form-control")
  },hashTypes:{'value': "ID",'class': "STRING"},hashContexts:{'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  stack1 = helpers.each.call(depth0, "errors.description", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div><div class=\"col-xs-3\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.image", options) : helperMissing.call(depth0, "t", "channels.form.image", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Dashboard.FileView", {hash:{
    'fileBinding': ("image"),
    'class': ("form-control")
  },hashTypes:{'fileBinding': "STRING",'class': "STRING"},hashContexts:{'fileBinding': depth0,'class': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</div><img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("image.image.large.url")
  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" class=\"col-xs-12\" /></div></div>");
  stack1 = helpers['if'].call(depth0, "user.id", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.video_url:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.video_url", options) : helperMissing.call(depth0, "t", "channels.form.video_url", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("video_url"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  stack1 = helpers.each.call(depth0, "errors.video_url", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div class=\"row\"><div class=\"col-xs-4\"><div class=\"form-group\"><div class=\"input-group\"><div class=\"input-group-addon\"><i class=\"fa fa-facebook\"></i></div>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("user.facebook_url"),
    'placeholder': ("http://facebook.com/"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'placeholder': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'placeholder': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></div><div class=\"col-xs-4\"><div class=\"form-group\"><div class=\"input-group\"><div class=\"input-group-addon\"><i class=\"fa fa-twitter\"></i></div>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("user.twitter_url"),
    'placeholder': ("http://twitter.com/"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'placeholder': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'placeholder': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></div><div class=\"col-xs-4\"><div class=\"form-group\"><div class=\"input-group\"><div class=\"input-group-addon\"><i class=\"fa fa-globe\"></i></div>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("user.other_url"),
    'placeholder': ("http://www."),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'placeholder': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'placeholder': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></div></div><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.submit_your_project_text:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.submit_your_project_text", options) : helperMissing.call(depth0, "t", "channels.form.submit_your_project_text", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea),options={hash:{
    'value': ("submit_your_project_text"),
    'class': ("form-control")
  },hashTypes:{'value': "ID",'class': "STRING"},hashContexts:{'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  stack1 = helpers.each.call(depth0, "errors.submit_your_project_text", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.how_it_works:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.how_it_works", options) : helperMissing.call(depth0, "t", "channels.form.how_it_works", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea),options={hash:{
    'value': ("how_it_works"),
    'class': ("form-control")
  },hashTypes:{'value': "ID",'class': "STRING"},hashContexts:{'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  stack1 = helpers.each.call(depth0, "errors.how_it_works", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><fieldset><h3>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content_fieldset", options) : helperMissing.call(depth0, "t", "channels.form.start_content_fieldset", options))));
  data.buffer.push("</h3><div class=\"row\"><div class=\"col-xs-8\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.title", options) : helperMissing.call(depth0, "t", "channels.form.start_content.title", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("start_content.title"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.subtitle", options) : helperMissing.call(depth0, "t", "channels.form.start_content.subtitle", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("start_content.subtitle"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div><div class=\"col-xs-4\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_hero_image", options) : helperMissing.call(depth0, "t", "channels.form.start_hero_image", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Dashboard.FileView", {hash:{
    'fileBinding': ("start_hero_image"),
    'class': ("form-control")
  },hashTypes:{'fileBinding': "STRING",'class': "STRING"},hashContexts:{'fileBinding': depth0,'class': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</div><p><img width=\"200\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("start_hero_image.start_hero_image.blur.url")
  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" /></p></div></div><div class=\"row\"><div class=\"col-xs-4\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.first_step_icon", options) : helperMissing.call(depth0, "t", "channels.form.start_content.first_step_icon", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("start_content.first_step_icon"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div><div class=\"col-xs-4\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.first_step_title", options) : helperMissing.call(depth0, "t", "channels.form.start_content.first_step_title", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("start_content.first_step_title"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div><div class=\"col-xs-4\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.first_step_description", options) : helperMissing.call(depth0, "t", "channels.form.start_content.first_step_description", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("start_content.first_step_description"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></div><div class=\"row\"><div class=\"col-xs-4\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.second_step_icon", options) : helperMissing.call(depth0, "t", "channels.form.start_content.second_step_icon", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("start_content.second_step_icon"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div><div class=\"col-xs-4\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.second_step_title", options) : helperMissing.call(depth0, "t", "channels.form.start_content.second_step_title", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("start_content.second_step_title"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div><div class=\"col-xs-4\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.second_step_description", options) : helperMissing.call(depth0, "t", "channels.form.start_content.second_step_description", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("start_content.second_step_description"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></div><div class=\"row\"><div class=\"col-xs-4\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.second_step_icon", options) : helperMissing.call(depth0, "t", "channels.form.start_content.second_step_icon", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("start_content.second_step_icon"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div><div class=\"col-xs-4\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.third_step_title", options) : helperMissing.call(depth0, "t", "channels.form.start_content.third_step_title", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("start_content.third_step_title"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div><div class=\"col-xs-4\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.third_step_description", options) : helperMissing.call(depth0, "t", "channels.form.start_content.third_step_description", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("start_content.third_step_description"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></div><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.start_primary_content", options) : helperMissing.call(depth0, "t", "channels.form.start_content.start_primary_content", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea),options={hash:{
    'type': ("text"),
    'value': ("start_content.start_primary_content"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  data.buffer.push("</div><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.start_content.start_secondary_content", options) : helperMissing.call(depth0, "t", "channels.form.start_content.start_secondary_content", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea),options={hash:{
    'type': ("text"),
    'value': ("start_content.start_secondary_content"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  data.buffer.push("</div></fieldset><fieldset><h3>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.success_content_fieldset", options) : helperMissing.call(depth0, "t", "channels.form.success_content_fieldset", options))));
  data.buffer.push("</h3><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.success_content.main_text", options) : helperMissing.call(depth0, "t", "channels.form.success_content.main_text", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea),options={hash:{
    'type': ("text"),
    'value': ("success_content.main_text"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  data.buffer.push("</div><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.success_content.button_text", options) : helperMissing.call(depth0, "t", "channels.form.success_content.button_text", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea),options={hash:{
    'type': ("text"),
    'value': ("success_content.button_text"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  data.buffer.push("</div><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.form.success_content.button_link", options) : helperMissing.call(depth0, "t", "channels.form.success_content.button_link", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea),options={hash:{
    'type': ("text"),
    'value': ("success_content.button_link"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  data.buffer.push("</div></fieldset><div class=\"form-actions\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("submit"),
    'valueTranslation': ("words.save"),
    'class': ("btn btn-primary")
  },hashTypes:{'type': "STRING",'valueTranslation': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'valueTranslation': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("&nbsp;<button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"btn\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.cancel", options) : helperMissing.call(depth0, "t", "words.cancel", options))));
  data.buffer.push("</button></div></form>");
  return buffer;
  
});
Ember.TEMPLATES["channels/edit"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels/form", options) : helperMissing.call(depth0, "partial", "channels/form", options))));
  
});
Ember.TEMPLATES["channels/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var helper, options;
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.index.new", options) : helperMissing.call(depth0, "t", "channels.index.new", options))));
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.index.tabs.all", options) : helperMissing.call(depth0, "t", "channels.index.tabs.all", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("<tr><td><a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("channel.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\">");
  stack1 = helpers._triageMustache.call(depth0, "channel.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a></td><td>");
  stack1 = helpers._triageMustache.call(depth0, "channel.permalink", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td><td>");
  data.buffer.push(escapeExpression((helper = helpers['format-date'] || (depth0 && depth0['format-date']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "channel.created_at", options) : helperMissing.call(depth0, "format-date", "channel.created_at", options))));
  data.buffer.push("</td><td><div class=\"dropdown\"><a data-toggle=\"dropdown\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-xs :dropdown-toggle channel.state")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "channel.state", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<span class=\"caret\"></span></a><ul class=\"dropdown-menu dropdown-menu-right\">");
  stack1 = helpers['if'].call(depth0, "channel.visible", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></div></td><td><div class=\"text-right\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(12, program12, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "channels.edit", "channel.id", options) : helperMissing.call(depth0, "link-to", "channels.edit", "channel.id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("&nbsp;<a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "destroy", "channel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\"><i class=\"fa fa-trash-o\"></i></a></div></td></tr>");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changeState", "channel", "push_to_draft", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.index.actions.push_to_draft", options) : helperMissing.call(depth0, "t", "channels.index.actions.push_to_draft", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changeState", "channel", "push_to_online", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.index.actions.push_to_online", options) : helperMissing.call(depth0, "t", "channels.index.actions.push_to_online", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program12(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-edit\"></i>");
  }

function program14(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<tr><td colspan=\"5\" class=\"no-results\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.no_results", options) : helperMissing.call(depth0, "t", "words.no_results", options))));
  data.buffer.push("</td></tr>");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<div class=\"pagination-wrapper-button\">");
  stack1 = helpers._triageMustache.call(depth0, "pagination", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  }

  data.buffer.push("<div class=\"page-controls\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("btn btn-primary")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.new", options) : helperMissing.call(depth0, "link-to", "channels.new", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels/search-form", options) : helperMissing.call(depth0, "partial", "channels/search-form", options))));
  data.buffer.push("<div class=\"nav-tabs-custom\"><ul class=\"nav nav-tabs\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(5, program5, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.tab", options) : helperMissing.call(depth0, "link-to", "channels.tab", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Dashboard.SearchTab", {hash:{
    'routeName': ("channels.search")
  },hashTypes:{'routeName': "STRING"},hashContexts:{'routeName': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("</ul><table class=\"table table-hover\"><thead><tr><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.index.table.name", options) : helperMissing.call(depth0, "t", "channels.index.table.name", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.index.table.permalink", options) : helperMissing.call(depth0, "t", "channels.index.table.permalink", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.index.table.created_at", options) : helperMissing.call(depth0, "t", "channels.index.table.created_at", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.index.table.state", options) : helperMissing.call(depth0, "t", "channels.index.table.state", options))));
  data.buffer.push("</th><th></th></tr></thead><tbody>");
  stack1 = helpers.each.call(depth0, "channel", "in", "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(14, program14, data),fn:self.program(7, program7, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</tbody></table>");
  stack1 = helpers['if'].call(depth0, "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  
});
Ember.TEMPLATES["channels/new"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels/form", options) : helperMissing.call(depth0, "partial", "channels/form", options))));
  
});
Ember.TEMPLATES["channels/search-form"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("<div class=\"box box-primary\"><form ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "submitSearch", {hash:{
    'on': ("submit")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"search\"><div class=\"box-body\"><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels.index.search.query", options) : helperMissing.call(depth0, "t", "channels.index.search.query", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("search.query"),
    'class': ("form-control")
  },hashTypes:{'value': "ID",'class': "STRING"},hashContexts:{'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></div></div><div class=\"box-footer\"><div class=\"text-right\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("submit"),
    'valueTranslation': ("words.search"),
    'class': ("btn btn-primary")
  },hashTypes:{'type': "STRING",'valueTranslation': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'valueTranslation': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></form></div>");
  return buffer;
  
});
Ember.TEMPLATES["contributions/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.tabs.pending", options) : helperMissing.call(depth0, "t", "contributions.index.tabs.pending", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.tabs.waiting_confirmation", options) : helperMissing.call(depth0, "t", "contributions.index.tabs.waiting_confirmation", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.tabs.confirmed", options) : helperMissing.call(depth0, "t", "contributions.index.tabs.confirmed", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.tabs.canceled", options) : helperMissing.call(depth0, "t", "contributions.index.tabs.canceled", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.tabs.refunded", options) : helperMissing.call(depth0, "t", "contributions.index.tabs.refunded", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.tabs.requested_refund", options) : helperMissing.call(depth0, "t", "contributions.index.tabs.requested_refund", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program15(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.tabs.refunded_and_canceled", options) : helperMissing.call(depth0, "t", "contributions.index.tabs.refunded_and_canceled", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("<tr><td><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "show", "contribution", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\" class=\"btn btn-primary btn-xs\"><i class=\"fa fa-eye\"></i></a></td><td><a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("contribution.project.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\">");
  stack1 = helpers._triageMustache.call(depth0, "contribution.project.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a></td><td><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":avatar :small contribution.user.profile_type")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("contribution.user.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\"><img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("contribution.user.image_url")
  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" class=\"img-circle\" /></a></div>&nbsp;<a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("contribution.user.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\">");
  stack1 = helpers._triageMustache.call(depth0, "contribution.user.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a></td><td>");
  stack1 = helpers._triageMustache.call(depth0, "contribution.user.email", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td><td>");
  data.buffer.push(escapeExpression((helper = helpers['number-to-currency'] || (depth0 && depth0['number-to-currency']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "contribution.value", options) : helperMissing.call(depth0, "number-to-currency", "contribution.value", options))));
  data.buffer.push("</td><td>");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Dashboard.AutoSaveCheckboxView", {hash:{
    'resource': ("contribution"),
    'attr': ("contribution.anonymous")
  },hashTypes:{'resource': "ID",'attr': "ID"},hashContexts:{'resource': depth0,'attr': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</td><td><div class=\"dropdown\"><a data-toggle=\"dropdown\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-xs :dropdown-toggle contribution.state")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "contribution.state", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<span class=\"caret\"></span></a><ul class=\"dropdown-menu dropdown-menu-right\">");
  stack1 = helpers['if'].call(depth0, "contribution.rights.can_confirm", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = helpers['if'].call(depth0, "contribution.rights.can_refund", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = helpers['if'].call(depth0, "contribution.rights.can_hide", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<li class=\"divider\">");
  stack1 = helpers['if'].call(depth0, "contribution.rights.can_pendent", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(24, program24, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = helpers['if'].call(depth0, "contribution.rights.can_cancel", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(26, program26, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = helpers['if'].call(depth0, "contribution.rights.can_push_to_trash", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(28, program28, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li></ul></div></td></tr>");
  return buffer;
  }
function program18(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changeState", "contribution", "confirm", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.actions.confirm", options) : helperMissing.call(depth0, "t", "contributions.index.actions.confirm", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program20(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changeState", "contribution", "refund", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.actions.refund", options) : helperMissing.call(depth0, "t", "contributions.index.actions.refund", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program22(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changeState", "contribution", "hide", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.actions.hide", options) : helperMissing.call(depth0, "t", "contributions.index.actions.hide", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program24(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changeState", "contribution", "pendent", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.actions.pendent", options) : helperMissing.call(depth0, "t", "contributions.index.actions.pendent", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program26(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changeState", "contribution", "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.actions.cancel", options) : helperMissing.call(depth0, "t", "contributions.index.actions.cancel", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program28(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "destroy", "contribution", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.actions.push_to_trash", options) : helperMissing.call(depth0, "t", "contributions.index.actions.push_to_trash", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program30(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<tr><td colspan=\"7\" class=\"no-results\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.no_results", options) : helperMissing.call(depth0, "t", "words.no_results", options))));
  data.buffer.push("</td></tr>");
  return buffer;
  }

function program32(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<div class=\"pagination-wrapper-button\">");
  stack1 = helpers._triageMustache.call(depth0, "pagination", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  }

  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions/search-form", options) : helperMissing.call(depth0, "partial", "contributions/search-form", options))));
  data.buffer.push("<div class=\"nav-tabs-custom\"><ul class=\"nav nav-tabs\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "contributions.tab", "pending", options) : helperMissing.call(depth0, "link-to", "contributions.tab", "pending", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(5, program5, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "contributions.tab", "waiting_confirmation", options) : helperMissing.call(depth0, "link-to", "contributions.tab", "waiting_confirmation", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(7, program7, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "contributions.tab", "confirmed", options) : helperMissing.call(depth0, "link-to", "contributions.tab", "confirmed", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(9, program9, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "contributions.tab", "canceled", options) : helperMissing.call(depth0, "link-to", "contributions.tab", "canceled", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(11, program11, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "contributions.tab", "refunded", options) : helperMissing.call(depth0, "link-to", "contributions.tab", "refunded", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(13, program13, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "contributions.tab", "requested_refund", options) : helperMissing.call(depth0, "link-to", "contributions.tab", "requested_refund", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(15, program15, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "contributions.tab", "refunded_and_canceled", options) : helperMissing.call(depth0, "link-to", "contributions.tab", "refunded_and_canceled", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Dashboard.SearchTab", {hash:{
    'routeName': ("contributions.search")
  },hashTypes:{'routeName': "STRING"},hashContexts:{'routeName': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("</ul><table class=\"table table-hover\"><thead><tr><th></th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.table.project", options) : helperMissing.call(depth0, "t", "contributions.index.table.project", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.table.user", options) : helperMissing.call(depth0, "t", "contributions.index.table.user", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.table.user_email", options) : helperMissing.call(depth0, "t", "contributions.index.table.user_email", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.table.value", options) : helperMissing.call(depth0, "t", "contributions.index.table.value", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.table.anonymous", options) : helperMissing.call(depth0, "t", "contributions.index.table.anonymous", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.table.state", options) : helperMissing.call(depth0, "t", "contributions.index.table.state", options))));
  data.buffer.push("</th></tr></thead><tbody>");
  stack1 = helpers.each.call(depth0, "contribution", "in", "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(30, program30, data),fn:self.program(17, program17, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</tbody></table>");
  stack1 = helpers['if'].call(depth0, "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(32, program32, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  
});
Ember.TEMPLATES["contributions/search-form"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("<div class=\"box box-primary\"><form ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "submitSearch", {hash:{
    'on': ("submit")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"search\"><div class=\"box-body\"><div class=\"row\"><div class=\"col-md-8\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.search.query", options) : helperMissing.call(depth0, "t", "contributions.index.search.query", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("search.query"),
    'class': ("form-control")
  },hashTypes:{'value': "ID",'class': "STRING"},hashContexts:{'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div><div class=\"col-md-4\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.index.search.between_values", options) : helperMissing.call(depth0, "t", "contributions.index.search.between_values", options))));
  data.buffer.push("</label><div class=\"row\"><div class=\"col-md-6\"><div class=\"input-group\"><span class=\"input-group-addon\">$</span>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("search.between_values.initial"),
    'class': ("form-control")
  },hashTypes:{'value': "ID",'class': "STRING"},hashContexts:{'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("<span class=\"input-group-addon\">.00</span></div></div><div class=\"col-md-6\"><div class=\"input-group\"><span class=\"input-group-addon\">$</span>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("search.between_values.final"),
    'class': ("form-control")
  },hashTypes:{'value': "ID",'class': "STRING"},hashContexts:{'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("<span class=\"input-group-addon\">.00</span></div></div></div></div></div></div><div class=\"box-footer\"><div class=\"text-right\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("submit"),
    'valueTranslation': ("words.search"),
    'class': ("btn btn-primary")
  },hashTypes:{'type': "STRING",'valueTranslation': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'valueTranslation': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></form></div>");
  return buffer;
  
});
Ember.TEMPLATES["contributions/show"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("<div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" type=\"button\" class=\"close\"><span aria-hidden=\"true\"> &times;</span><span class=\"sr-only\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.close", options) : helperMissing.call(depth0, "t", "words.close", options))));
  data.buffer.push("</span></button><h4 class=\"modal-title\"><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":avatar :small user.profile_type")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("user.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\"><img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("user.image_url")
  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" class=\"img-circle\" /></a></div>&nbsp;<a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("user.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\">");
  stack1 = helpers._triageMustache.call(depth0, "user.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.contribution_to", options) : helperMissing.call(depth0, "t", "contributions.show.contribution_to", options))));
  data.buffer.push("&nbsp;<a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("project.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\">");
  stack1 = helpers._triageMustache.call(depth0, "project.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a></h4></div><div class=\"modal-body\"><dl class=\"details\"><dt>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.value", options) : helperMissing.call(depth0, "t", "contributions.show.value", options))));
  data.buffer.push("</dt><dd>");
  data.buffer.push(escapeExpression((helper = helpers['number-to-currency'] || (depth0 && depth0['number-to-currency']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "value", options) : helperMissing.call(depth0, "number-to-currency", "value", options))));
  data.buffer.push("</dd><dt>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.payment_method", options) : helperMissing.call(depth0, "t", "contributions.show.payment_method", options))));
  data.buffer.push("</dt><dd>");
  stack1 = helpers._triageMustache.call(depth0, "payment_method", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</dd><dt>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.payment_service_fee", options) : helperMissing.call(depth0, "t", "contributions.show.payment_service_fee", options))));
  data.buffer.push("</dt><dd>");
  data.buffer.push(escapeExpression((helper = helpers['number-to-currency'] || (depth0 && depth0['number-to-currency']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "payment_service_fee", options) : helperMissing.call(depth0, "number-to-currency", "payment_service_fee", options))));
  data.buffer.push("</dd><dt>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.payment_service_fee_paid_by_user", options) : helperMissing.call(depth0, "t", "contributions.show.payment_service_fee_paid_by_user", options))));
  data.buffer.push("</dt><dd>");
  data.buffer.push(escapeExpression((helper = helpers['show-boolean'] || (depth0 && depth0['show-boolean']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "payment_service_fee_paid_by_user", options) : helperMissing.call(depth0, "show-boolean", "payment_service_fee_paid_by_user", options))));
  data.buffer.push("</dd><dt>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.payment_id", options) : helperMissing.call(depth0, "t", "contributions.show.payment_id", options))));
  data.buffer.push("</dt><dd><span>");
  stack1 = helpers._triageMustache.call(depth0, "payment_id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span></dd><dt>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.key", options) : helperMissing.call(depth0, "t", "contributions.show.key", options))));
  data.buffer.push("</dt><dd><span>");
  stack1 = helpers._triageMustache.call(depth0, "key", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span></dd><dt>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.reward.title", options) : helperMissing.call(depth0, "t", "contributions.show.reward.title", options))));
  data.buffer.push("</dt><dd>");
  stack1 = helpers._triageMustache.call(depth0, "reward.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</dd><dt>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.reward.minimum_value", options) : helperMissing.call(depth0, "t", "contributions.show.reward.minimum_value", options))));
  data.buffer.push("</dt><dd>");
  data.buffer.push(escapeExpression((helper = helpers['number-to-currency'] || (depth0 && depth0['number-to-currency']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "reward.minimum_value", options) : helperMissing.call(depth0, "number-to-currency", "reward.minimum_value", options))));
  data.buffer.push("</dd><dt>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.user_email", options) : helperMissing.call(depth0, "t", "contributions.show.user_email", options))));
  data.buffer.push("</dt><dd>");
  stack1 = helpers._triageMustache.call(depth0, "user.email", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</dd><dt>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.created_at", options) : helperMissing.call(depth0, "t", "contributions.show.created_at", options))));
  data.buffer.push("</dt><dd>");
  data.buffer.push(escapeExpression((helper = helpers['format-date'] || (depth0 && depth0['format-date']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "created_at", options) : helperMissing.call(depth0, "format-date", "created_at", options))));
  data.buffer.push("</dd><dt>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions.show.confirmed_at", options) : helperMissing.call(depth0, "t", "contributions.show.confirmed_at", options))));
  data.buffer.push("</dt><dd>");
  data.buffer.push(escapeExpression((helper = helpers['format-date'] || (depth0 && depth0['format-date']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "confirmed_at", options) : helperMissing.call(depth0, "format-date", "confirmed_at", options))));
  data.buffer.push("</dd></dl></div><div class=\"modal-footer\"><button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" type=\"button\" class=\"btn btn-primary\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.okay", options) : helperMissing.call(depth0, "t", "words.okay", options))));
  data.buffer.push("</button></div></div></div>");
  return buffer;
  
});
Ember.TEMPLATES["daterangepicker"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<label>");
  stack1 = helpers._triageMustache.call(depth0, "view.label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'class': ("daterangepicker-input form-control pull-right")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("<div class=\"hide\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("view.start")
  },hashTypes:{'value': "ID"},hashContexts:{'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("view.end")
  },hashTypes:{'value': "ID"},hashContexts:{'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div>");
  return buffer;
  
});
Ember.TEMPLATES["layouts/application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push(escapeExpression((helper = helpers.render || (depth0 && depth0.render),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "header", options) : helperMissing.call(depth0, "render", "header", options))));
  data.buffer.push("<div class=\"wrapper row-offcanvas row-offcanvas-left\"><aside class=\"left-side sidebar-offcanvas\">");
  data.buffer.push(escapeExpression((helper = helpers.render || (depth0 && depth0.render),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "sidebar", options) : helperMissing.call(depth0, "render", "sidebar", options))));
  data.buffer.push("</aside><aside class=\"right-side\"><section class=\"content-header\">");
  stack1 = helpers._triageMustache.call(depth0, "page-title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = helpers._triageMustache.call(depth0, "bs-breadcrumbs", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</section><section class=\"content\">");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</section></aside></div>");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "modal", options) : helperMissing.call(depth0, "outlet", "modal", options))));
  return buffer;
  }

function program3(depth0,data) {
  
  var helper, options;
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "login", options) : helperMissing.call(depth0, "outlet", "login", options))));
  }

  stack1 = helpers['if'].call(depth0, "session.isAuthenticated", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  
});
Ember.TEMPLATES["layouts/header"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  data.buffer.push("www.dune-investissement.fr");
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

  data.buffer.push("<header class=\"header\"><h1 class=\"name\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "index", options) : helperMissing.call(depth0, "link-to", "index", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h1><nav role=\"navigation\" class=\"navbar navbar-static-top\"><a data-toggle=\"offcanvas\" href=\"#\" role=\"button\" class=\"navbar-btn sidebar-toggle\"><span class=\"sr-only\">Toggle navigation</span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span></a><div class=\"navbar-right\"><ul class=\"nav navbar-nav\"><li class=\"dropdown user\"><a data-toggle=\"dropdown\" href=\"#\" class=\"dropdown-toggle\"><img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("session.currentUser.image_url")
  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" class=\"img-circle\" /><span class=\"current-user-name\">");
  stack1 = helpers._triageMustache.call(depth0, "session.currentUser.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<i class=\"caret\"></i></span></a><ul class=\"dropdown-menu\"><li><a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("session.currentUser.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "layouts.header.profile", options) : helperMissing.call(depth0, "t", "layouts.header.profile", options))));
  data.buffer.push("</a></li><li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "invalidateSession", {hash:{
    'on': ("click")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" href=\"#\" class=\"user-sign-out\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "layouts.header.sign_out", options) : helperMissing.call(depth0, "t", "layouts.header.sign_out", options))));
  data.buffer.push("</a></li></ul></li></ul></div></nav></header>");
  return buffer;
  
});
Ember.TEMPLATES["layouts/sidebar"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<i class=\"fa fa-bar-chart-o\"></i><span>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "layouts.sidebar.dashboard", options) : helperMissing.call(depth0, "t", "layouts.sidebar.dashboard", options))));
  data.buffer.push("</span>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<i class=\"fa fa-th-large\"></i><span>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "layouts.sidebar.projects", options) : helperMissing.call(depth0, "t", "layouts.sidebar.projects", options))));
  data.buffer.push("</span>");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("<li>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(8, program8, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contributions", options) : helperMissing.call(depth0, "link-to", "contributions", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li><li>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(10, program10, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "users", options) : helperMissing.call(depth0, "link-to", "users", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li><li>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(12, program12, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "channels", options) : helperMissing.call(depth0, "link-to", "channels", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li><li>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(14, program14, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags", options) : helperMissing.call(depth0, "link-to", "tags", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li><li>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(16, program16, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets", options) : helperMissing.call(depth0, "link-to", "press_assets", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li>");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<i class=\"fa fa-credit-card\"></i><span>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "layouts.sidebar.contributions", options) : helperMissing.call(depth0, "t", "layouts.sidebar.contributions", options))));
  data.buffer.push("</span>");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<i class=\"fa fa-users\"></i><span>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "layouts.sidebar.users", options) : helperMissing.call(depth0, "t", "layouts.sidebar.users", options))));
  data.buffer.push("</span>");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<i class=\"fa fa-bookmark\"></i><span>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "layouts.sidebar.channels", options) : helperMissing.call(depth0, "t", "layouts.sidebar.channels", options))));
  data.buffer.push("</span>");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<i class=\"fa fa-tags\"></i><span>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "layouts.sidebar.tags", options) : helperMissing.call(depth0, "t", "layouts.sidebar.tags", options))));
  data.buffer.push("</span>");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<i class=\"fa fa-file-text\"></i><span>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "layouts.sidebar.press_assets", options) : helperMissing.call(depth0, "t", "layouts.sidebar.press_assets", options))));
  data.buffer.push("</span>");
  return buffer;
  }

  data.buffer.push("<section class=\"sidebar\"><ul class=\"sidebar-menu\"><li>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "index", options) : helperMissing.call(depth0, "link-to", "index", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li><li>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(5, program5, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects", options) : helperMissing.call(depth0, "link-to", "projects", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li>");
  stack1 = helpers['if'].call(depth0, "session.currentUser.admin", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></section>");
  return buffer;
  
});
Ember.TEMPLATES["pagination"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<li ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("active disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "gotoPage", "page", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\">");
  stack1 = helpers._triageMustache.call(depth0, "value", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a></li>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

  data.buffer.push("<ul class=\"pagination\"><li ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":previous view.isFirst:disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "previousPage", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" href=\"#\">«</a></li>");
  stack1 = helpers.each.call(depth0, "view.pages", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<li ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":next view.isLast:disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "nextPage", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" href=\"#\">»</a></li></ul>");
  return buffer;
  
});
Ember.TEMPLATES["press_assets/_form"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<span class=\"error\">");
  stack1 = helpers._triageMustache.call(depth0, "message", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

  data.buffer.push("<form ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {hash:{
    'on': ("submit")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" enctype=\"multipart/form-data\"><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.title:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets.form.title", options) : helperMissing.call(depth0, "t", "press_assets.form.title", options))));
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("title"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</label>");
  stack1 = helpers.each.call(depth0, "errors.title", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.url:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets.form.url", options) : helperMissing.call(depth0, "t", "press_assets.form.url", options))));
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("url"),
    'value': ("url"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</label>");
  stack1 = helpers.each.call(depth0, "errors.url", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.image:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets.form.image", options) : helperMissing.call(depth0, "t", "press_assets.form.image", options))));
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Dashboard.FileView", {hash:{
    'fileBinding': ("image"),
    'class': ("form-control")
  },hashTypes:{'fileBinding': "STRING",'class': "STRING"},hashContexts:{'fileBinding': depth0,'class': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</label>");
  stack1 = helpers.each.call(depth0, "errors.image", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div class=\"form-actions\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("submit"),
    'valueTranslation': ("words.save"),
    'class': ("btn btn-primary")
  },hashTypes:{'type': "STRING",'valueTranslation': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'valueTranslation': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("&nbsp;<button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"btn\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.cancel", options) : helperMissing.call(depth0, "t", "words.cancel", options))));
  data.buffer.push("</button></div></form>");
  return buffer;
  
});
Ember.TEMPLATES["press_assets/edit"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets/form", options) : helperMissing.call(depth0, "partial", "press_assets/form", options))));
  
});
Ember.TEMPLATES["press_assets/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var helper, options;
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets.index.new", options) : helperMissing.call(depth0, "t", "press_assets.index.new", options))));
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets.index.tabs.all", options) : helperMissing.call(depth0, "t", "press_assets.index.tabs.all", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("<tr><td>");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td><td><a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\">");
  stack1 = helpers._triageMustache.call(depth0, "url", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a></td><td><img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("image_url")
  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" width=\"100\" /></td><td><div class=\"text-right\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(8, program8, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "press_assets.edit", "id", options) : helperMissing.call(depth0, "link-to", "press_assets.edit", "id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("&nbsp;<a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "destroy", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\"><i class=\"fa fa-trash-o\"></i></a></div></td></tr>");
  return buffer;
  }
function program8(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-edit\"></i>");
  }

function program10(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<tr><td colspan=\"4\" class=\"no-results\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.no_results", options) : helperMissing.call(depth0, "t", "words.no_results", options))));
  data.buffer.push("</td></tr>");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<div class=\"pagination-wrapper-button\">");
  stack1 = helpers._triageMustache.call(depth0, "pagination", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  }

  data.buffer.push("<div class=\"page-controls\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("btn btn-primary")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets.new", options) : helperMissing.call(depth0, "link-to", "press_assets.new", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div class=\"nav-tabs-custom\"><ul class=\"nav nav-tabs\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(5, program5, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets", options) : helperMissing.call(depth0, "link-to", "press_assets", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul><table class=\"table table-hover\"><thead><tr><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets.index.table.title", options) : helperMissing.call(depth0, "t", "press_assets.index.table.title", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets.index.table.url", options) : helperMissing.call(depth0, "t", "press_assets.index.table.url", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets.index.table.image", options) : helperMissing.call(depth0, "t", "press_assets.index.table.image", options))));
  data.buffer.push("</th><th></th></tr></thead><tbody>");
  stack1 = helpers.each.call(depth0, "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</tbody></table>");
  stack1 = helpers['if'].call(depth0, "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  
});
Ember.TEMPLATES["press_assets/new"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "press_assets/form", options) : helperMissing.call(depth0, "partial", "press_assets/form", options))));
  
});
Ember.TEMPLATES["projects/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.tabs.online", options) : helperMissing.call(depth0, "t", "projects.index.tabs.online", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.tabs.soon", options) : helperMissing.call(depth0, "t", "projects.index.tabs.soon", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.tabs.draft", options) : helperMissing.call(depth0, "t", "projects.index.tabs.draft", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.tabs.successful", options) : helperMissing.call(depth0, "t", "projects.index.tabs.successful", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.tabs.failed", options) : helperMissing.call(depth0, "t", "projects.index.tabs.failed", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.tabs.rejected", options) : helperMissing.call(depth0, "t", "projects.index.tabs.rejected", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program15(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.tabs.waiting_funds", options) : helperMissing.call(depth0, "t", "projects.index.tabs.waiting_funds", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("<tr><td>");
  stack1 = helpers['if'].call(depth0, "project.channel", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("project.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\">");
  stack1 = helpers._triageMustache.call(depth0, "project.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>");
  stack1 = helpers['if'].call(depth0, "session.currentUser.admin", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td><td><a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("project.user.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\">");
  stack1 = helpers._triageMustache.call(depth0, "project.user.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a></td><td>");
  data.buffer.push(escapeExpression((helper = helpers['number-to-currency'] || (depth0 && depth0['number-to-currency']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "project.goal", options) : helperMissing.call(depth0, "number-to-currency", "project.goal", options))));
  data.buffer.push("</td><td>");
  data.buffer.push(escapeExpression((helper = helpers['number-to-currency'] || (depth0 && depth0['number-to-currency']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "project.pledged", options) : helperMissing.call(depth0, "number-to-currency", "project.pledged", options))));
  data.buffer.push("</td><td>");
  data.buffer.push(escapeExpression((helper = helpers['format-date'] || (depth0 && depth0['format-date']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "project.expires_at", options) : helperMissing.call(depth0, "format-date", "project.expires_at", options))));
  data.buffer.push("</td><td><div class=\"dropdown\"><a data-toggle=\"dropdown\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-xs :dropdown-toggle project.state")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "project.state", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<span class=\"caret\"></span></a><ul class=\"dropdown-menu dropdown-menu-right\">");
  stack1 = helpers['if'].call(depth0, "project.rights.can_approve", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = helpers['if'].call(depth0, "project.rights.can_launch", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(24, program24, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = helpers['if'].call(depth0, "project.rights.can_reject", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(26, program26, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<li class=\"divider\">");
  stack1 = helpers['if'].call(depth0, "project.rights.can_push_to_draft", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(28, program28, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = helpers['if'].call(depth0, "project.rights.can_push_to_trash", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(30, program30, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li></ul></div></td></tr>");
  return buffer;
  }
function program18(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<div class=\"label label-default\">");
  stack1 = helpers._triageMustache.call(depth0, "project.channel.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>&nbsp; - &nbsp;");
  return buffer;
  }

function program20(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<hr /><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":label project.recommended:label-success:label-light")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.table.recommended", options) : helperMissing.call(depth0, "t", "projects.index.table.recommended", options))));
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Dashboard.AutoSaveCheckboxView", {hash:{
    'resource': ("project"),
    'attr': ("project.recommended")
  },hashTypes:{'resource': "ID",'attr': "ID"},hashContexts:{'resource': depth0,'attr': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</div>&nbsp;<div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":label project.featured:label-info:label-light")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.table.featured", options) : helperMissing.call(depth0, "t", "projects.index.table.featured", options))));
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Dashboard.AutoSaveCheckboxView", {hash:{
    'resource': ("project"),
    'attr': ("project.featured")
  },hashTypes:{'resource': "ID",'attr': "ID"},hashContexts:{'resource': depth0,'attr': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</div>&nbsp;<div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":label project.home_page:label-warning:label-light")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.table.home_page", options) : helperMissing.call(depth0, "t", "projects.index.table.home_page", options))));
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Dashboard.AutoSaveCheckboxView", {hash:{
    'resource': ("project"),
    'attr': ("project.home_page")
  },hashTypes:{'resource': "ID",'attr': "ID"},hashContexts:{'resource': depth0,'attr': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</div>");
  return buffer;
  }

function program22(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changeState", "project", "approve", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.actions.approve", options) : helperMissing.call(depth0, "t", "projects.index.actions.approve", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program24(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "launch", "project", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.actions.launch", options) : helperMissing.call(depth0, "t", "projects.index.actions.launch", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program26(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changeState", "project", "reject", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.actions.reject", options) : helperMissing.call(depth0, "t", "projects.index.actions.reject", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program28(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changeState", "project", "push_to_draft", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.actions.push_to_draft", options) : helperMissing.call(depth0, "t", "projects.index.actions.push_to_draft", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program30(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<li><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "destroy", "project", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\" tabindex=\"-1\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.actions.push_to_trash", options) : helperMissing.call(depth0, "t", "projects.index.actions.push_to_trash", options))));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program32(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<tr><td colspan=\"6\" class=\"no-results\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.no_results", options) : helperMissing.call(depth0, "t", "words.no_results", options))));
  data.buffer.push("</td></tr>");
  return buffer;
  }

function program34(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<div class=\"pagination-wrapper-button\">");
  stack1 = helpers._triageMustache.call(depth0, "pagination", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  }

  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects/search-form", options) : helperMissing.call(depth0, "partial", "projects/search-form", options))));
  data.buffer.push("<div class=\"nav-tabs-custom\"><ul class=\"nav nav-tabs\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "projects.tab", "online", options) : helperMissing.call(depth0, "link-to", "projects.tab", "online", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(5, program5, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "projects.tab", "soon", options) : helperMissing.call(depth0, "link-to", "projects.tab", "soon", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(7, program7, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "projects.tab", "draft", options) : helperMissing.call(depth0, "link-to", "projects.tab", "draft", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(9, program9, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "projects.tab", "successful", options) : helperMissing.call(depth0, "link-to", "projects.tab", "successful", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(11, program11, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "projects.tab", "failed", options) : helperMissing.call(depth0, "link-to", "projects.tab", "failed", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(13, program13, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "projects.tab", "rejected", options) : helperMissing.call(depth0, "link-to", "projects.tab", "rejected", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(15, program15, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "projects.tab", "waiting_funds", options) : helperMissing.call(depth0, "link-to", "projects.tab", "waiting_funds", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Dashboard.SearchTab", {hash:{
    'routeName': ("projects.search")
  },hashTypes:{'routeName': "STRING"},hashContexts:{'routeName': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("</ul><table class=\"table table-hover\"><thead><tr><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.table.name", options) : helperMissing.call(depth0, "t", "projects.index.table.name", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.table.user", options) : helperMissing.call(depth0, "t", "projects.index.table.user", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.table.goal", options) : helperMissing.call(depth0, "t", "projects.index.table.goal", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.table.pledged", options) : helperMissing.call(depth0, "t", "projects.index.table.pledged", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.table.expires_at", options) : helperMissing.call(depth0, "t", "projects.index.table.expires_at", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.table.state", options) : helperMissing.call(depth0, "t", "projects.index.table.state", options))));
  data.buffer.push("</th></tr></thead><tbody>");
  stack1 = helpers.each.call(depth0, "project", "in", "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(32, program32, data),fn:self.program(17, program17, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</tbody></table>");
  stack1 = helpers['if'].call(depth0, "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(34, program34, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  
});
Ember.TEMPLATES["projects/search-form"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("<div class=\"box box-primary\"><form ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "submitSearch", {hash:{
    'on': ("submit")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"search\"><div class=\"box-body\"><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "projects.index.search.query", options) : helperMissing.call(depth0, "t", "projects.index.search.query", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("search.query"),
    'class': ("form-control")
  },hashTypes:{'value': "ID",'class': "STRING"},hashContexts:{'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div><div class=\"col-md-2\">");
  data.buffer.push(escapeExpression((helper = helpers.daterangepicker || (depth0 && depth0.daterangepicker),options={hash:{
    'labelTranslation': ("projects.index.search.between_created_at"),
    'startBinding': ("search.between_created_at.starts_at"),
    'endBinding': ("search.between_created_at.ends_at")
  },hashTypes:{'labelTranslation': "STRING",'startBinding': "STRING",'endBinding': "STRING"},hashContexts:{'labelTranslation': depth0,'startBinding': depth0,'endBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "daterangepicker", options))));
  data.buffer.push("</div><div class=\"col-md-2\">");
  data.buffer.push(escapeExpression((helper = helpers.daterangepicker || (depth0 && depth0.daterangepicker),options={hash:{
    'labelTranslation': ("projects.index.search.between_expires_at"),
    'startBinding': ("search.between_expires_at.starts_at"),
    'endBinding': ("search.between_expires_at.ends_at")
  },hashTypes:{'labelTranslation': "STRING",'startBinding': "STRING",'endBinding': "STRING"},hashContexts:{'labelTranslation': depth0,'startBinding': depth0,'endBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "daterangepicker", options))));
  data.buffer.push("</div><div class=\"col-md-2\">");
  data.buffer.push(escapeExpression((helper = helpers.daterangepicker || (depth0 && depth0.daterangepicker),options={hash:{
    'labelTranslation': ("projects.index.search.between_online_date"),
    'startBinding': ("search.between_online_date.starts_at"),
    'endBinding': ("search.between_online_date.ends_at")
  },hashTypes:{'labelTranslation': "STRING",'startBinding': "STRING",'endBinding': "STRING"},hashContexts:{'labelTranslation': depth0,'startBinding': depth0,'endBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "daterangepicker", options))));
  data.buffer.push("</div></div></div><div class=\"box-footer\"><div class=\"text-right\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("submit"),
    'valueTranslation': ("words.search"),
    'class': ("btn btn-primary")
  },hashTypes:{'type': "STRING",'valueTranslation': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'valueTranslation': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></form></div>");
  return buffer;
  
});
Ember.TEMPLATES["search-tab"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["ID","ID"],data:data},helper ? helper.call(depth0, "view.routeName", "view.routeParams", options) : helperMissing.call(depth0, "link-to", "view.routeName", "view.routeParams", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<li><i ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeSearch", {hash:{
    'on': ("click")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"fa fa-times close\"></i></li>");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.search_results", options) : helperMissing.call(depth0, "t", "words.search_results", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, "view.hasSearch", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  
});
Ember.TEMPLATES["sessions/new"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  stack1 = helpers._triageMustache.call(depth0, "bs-notifications", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<div class=\"bg-black entire-page\"></div><div class=\"form-box\"><div class=\"header\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "sessions.new.title", options) : helperMissing.call(depth0, "t", "sessions.new.title", options))));
  data.buffer.push("</div><form ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "authenticate", {hash:{
    'on': ("submit")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><div class=\"body bg-gray\"><div class=\"form-group\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("identification"),
    'placeholderTranslation': ("sessions.new.email"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'placeholderTranslation': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'placeholderTranslation': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div><div class=\"form-group\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("password"),
    'value': ("password"),
    'placeholderTranslation': ("sessions.new.password"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'placeholderTranslation': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'placeholderTranslation': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("<div class=\"text-right\"><a href=\"https://www.dune-investissement.fr/password/new\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "sessions.new.forget_password", options) : helperMissing.call(depth0, "t", "sessions.new.forget_password", options))));
  data.buffer.push("</a></div></div></div><div class=\"footer\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("submit"),
    'valueTranslation': ("sessions.new.submit"),
    'class': ("btn bg-olive btn-block")
  },hashTypes:{'type': "STRING",'valueTranslation': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'valueTranslation': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("<a href=\"https://www.dune-investissement.fr/sign_up\" class=\"text-center\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "sessions.new.sign-up", options) : helperMissing.call(depth0, "t", "sessions.new.sign-up", options))));
  data.buffer.push("</a></div></form></div>");
  return buffer;
  
});
Ember.TEMPLATES["tags/_form"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<span class=\"error\">");
  stack1 = helpers._triageMustache.call(depth0, "message", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

  data.buffer.push("<form ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {hash:{
    'on': ("submit")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.name:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags.form.name", options) : helperMissing.call(depth0, "t", "tags.form.name", options))));
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("name"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</label>");
  stack1 = helpers.each.call(depth0, "errors.name", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group errors.visible:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags.form.visible", options) : helperMissing.call(depth0, "t", "tags.form.visible", options))));
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("visible"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'checked': "ID",'class': "STRING"},hashContexts:{'type': depth0,'checked': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</label>");
  stack1 = helpers.each.call(depth0, "errors.visible", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div class=\"form-actions\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("submit"),
    'valueTranslation': ("words.save"),
    'class': ("btn btn-primary")
  },hashTypes:{'type': "STRING",'valueTranslation': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'valueTranslation': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("&nbsp;<button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"btn\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.cancel", options) : helperMissing.call(depth0, "t", "words.cancel", options))));
  data.buffer.push("</button></div></form>");
  return buffer;
  
});
Ember.TEMPLATES["tags/edit"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags/form", options) : helperMissing.call(depth0, "partial", "tags/form", options))));
  
});
Ember.TEMPLATES["tags/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var helper, options;
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags.index.new", options) : helperMissing.call(depth0, "t", "tags.index.new", options))));
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags.index.popular", options) : helperMissing.call(depth0, "t", "tags.index.popular", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags.index.all", options) : helperMissing.call(depth0, "t", "tags.index.all", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("<tr><td>");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td><td>");
  data.buffer.push(escapeExpression((helper = helpers['show-boolean'] || (depth0 && depth0['show-boolean']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "visible", options) : helperMissing.call(depth0, "show-boolean", "visible", options))));
  data.buffer.push("</td><td>");
  stack1 = helpers._triageMustache.call(depth0, "total_projects", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td><td><div class=\"text-right\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(10, program10, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "tags.edit", "id", options) : helperMissing.call(depth0, "link-to", "tags.edit", "id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("&nbsp;<a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "destroy", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\"><i class=\"fa fa-trash-o\"></i></a></div></td></tr>");
  return buffer;
  }
function program10(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-edit\"></i>");
  }

function program12(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<tr><td colspan=\"4\" class=\"no-results\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.no_results", options) : helperMissing.call(depth0, "t", "words.no_results", options))));
  data.buffer.push("</td></tr>");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<div class=\"pagination-wrapper-button\">");
  stack1 = helpers._triageMustache.call(depth0, "pagination", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  }

  data.buffer.push("<div class=\"page-controls\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("btn btn-primary")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags.new", options) : helperMissing.call(depth0, "link-to", "tags.new", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div class=\"nav-tabs-custom\"><ul class=\"nav nav-tabs\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(5, program5, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "tags.tab", "popular", options) : helperMissing.call(depth0, "link-to", "tags.tab", "popular", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(7, program7, data),contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "tags.tab", "all", options) : helperMissing.call(depth0, "link-to", "tags.tab", "all", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul><table class=\"table table-hover\"><thead><tr><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags.index.name", options) : helperMissing.call(depth0, "t", "tags.index.name", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags.index.visible", options) : helperMissing.call(depth0, "t", "tags.index.visible", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags.index.total_projects", options) : helperMissing.call(depth0, "t", "tags.index.total_projects", options))));
  data.buffer.push("</th><th></th></tr></thead><tbody>");
  stack1 = helpers.each.call(depth0, "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(12, program12, data),fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</tbody></table>");
  stack1 = helpers['if'].call(depth0, "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  
});
Ember.TEMPLATES["tags/new"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "tags/form", options) : helperMissing.call(depth0, "partial", "tags/form", options))));
  
});
Ember.TEMPLATES["users/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<a href=\"#\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "users.index.tabs.all", options) : helperMissing.call(depth0, "t", "users.index.tabs.all", options))));
  data.buffer.push("</a>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("<tr><td><div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":avatar :small user.profile_type")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("user.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\"><img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("user.image_url")
  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" class=\"img-circle\" /></a></div></td><td><a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("user.html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\">");
  stack1 = helpers._triageMustache.call(depth0, "user.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a></td><td>");
  stack1 = helpers._triageMustache.call(depth0, "user.email", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td><td>");
  data.buffer.push(escapeExpression((helper = helpers['number-to-currency'] || (depth0 && depth0['number-to-currency']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "user.total_contributed", options) : helperMissing.call(depth0, "number-to-currency", "user.total_contributed", options))));
  data.buffer.push("</td><td>");
  data.buffer.push(escapeExpression((helper = helpers['format-date'] || (depth0 && depth0['format-date']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "user.created_at", options) : helperMissing.call(depth0, "format-date", "user.created_at", options))));
  data.buffer.push("</td><td><div class=\"text-right\"><a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("user.edit_html_url")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" target=\"blank\"><i class=\"fa fa-edit\"></i></a></div></td></tr>");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<tr><td colspan=\"6\" class=\"no-results\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "words.no_results", options) : helperMissing.call(depth0, "t", "words.no_results", options))));
  data.buffer.push("</td></tr>");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<div class=\"pagination-wrapper-button\">");
  stack1 = helpers._triageMustache.call(depth0, "pagination", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  }

  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "users/search-form", options) : helperMissing.call(depth0, "partial", "users/search-form", options))));
  data.buffer.push("<div class=\"nav-tabs-custom\"><ul class=\"nav nav-tabs\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'tagName': ("li")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "users.tab", options) : helperMissing.call(depth0, "link-to", "users.tab", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Dashboard.SearchTab", {hash:{
    'routeName': ("users.search")
  },hashTypes:{'routeName': "STRING"},hashContexts:{'routeName': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("</ul><table class=\"table table-hover\"><thead><tr><th></th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "users.index.table.name", options) : helperMissing.call(depth0, "t", "users.index.table.name", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "users.index.table.email", options) : helperMissing.call(depth0, "t", "users.index.table.email", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "users.index.table.total_contributed", options) : helperMissing.call(depth0, "t", "users.index.table.total_contributed", options))));
  data.buffer.push("</th><th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "users.index.table.created_at", options) : helperMissing.call(depth0, "t", "users.index.table.created_at", options))));
  data.buffer.push("</th><th></th></tr></thead><tbody>");
  stack1 = helpers.each.call(depth0, "user", "in", "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</tbody></table>");
  stack1 = helpers['if'].call(depth0, "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  
});
Ember.TEMPLATES["users/search-form"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("<div class=\"box box-primary\"><form ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "submitSearch", {hash:{
    'on': ("submit")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"search\"><div class=\"box-body\"><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "users.index.search.query", options) : helperMissing.call(depth0, "t", "users.index.search.query", options))));
  data.buffer.push("</label>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("search.query"),
    'class': ("form-control")
  },hashTypes:{'value': "ID",'class': "STRING"},hashContexts:{'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></div></div><div class=\"box-footer\"><div class=\"text-right\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("submit"),
    'valueTranslation': ("words.search"),
    'class': ("btn btn-primary")
  },hashTypes:{'type': "STRING",'valueTranslation': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'valueTranslation': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div></div></form></div>");
  return buffer;
  
});
(function() {
  Ember.Handlebars.helper('daterangepicker', Dashboard.DaterangepickerView);

}).call(this);
(function() {
  Ember.Handlebars.registerBoundHelper('format-date', function(date, format) {
    if (typeof format !== "string") {
      format = 'MMMM Do YYYY';
    }
    return moment(date).format(format);
  });

}).call(this);
(function() {
  Dashboard.Loading = {
    activate: function() {
      this.timer = Ember.run.later(this, (function() {
        return $('section.content').addClass('loading-section');
      }), 250);
      return this;
    },
    deactivate: function() {
      $('section.content').removeClass('loading-section');
      if (this.timer) {
        return Ember.run.cancel(this.timer);
      }
    }
  };

}).call(this);
(function() {
  Ember.Handlebars.registerBoundHelper('number-to-currency', function(number, format) {
    if (typeof format !== "string") {
      format = '$0,0[.]00';
    }
    return numeral(number).format(format);
  });

}).call(this);
(function() {
  Ember.Handlebars.helper('pagination', Dashboard.PaginationView);

}).call(this);
(function() {
  Ember.Handlebars.helper('show-boolean', function(value) {
    if (value) {
      return Ember.I18n.t('words._yes');
    } else {
      return Ember.I18n.t('words._no');
    }
  });

}).call(this);
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
(function() {
  Dashboard.ChannelsEditRoute = Dashboard.AuthenticatedRoute.extend({
    title: Ember.I18n.t('titles.channels.edit'),
    model: function(params) {
      return this.store.find('channel', params['id']);
    }
  });

}).call(this);
(function() {
  Dashboard.ChannelsNewRoute = Dashboard.AuthenticatedRoute.extend({
    title: Ember.I18n.t('titles.channels.new'),
    model: function() {
      return this.store.createRecord('channel', {
        user: this.store.createRecord('user', {})
      });
    }
  });

}).call(this);
(function() {
  Dashboard.ChannelsIndexRoute = Dashboard.AuthenticatedRoute.extend({
    redirect: function() {
      return this.transitionTo('channels.tab');
    }
  });

  Dashboard.ChannelsTabRoute = Dashboard.AuthenticatedRoute.extend({
    breadcrumbs: false,
    title: Ember.I18n.t('titles.channels.index'),
    renderTemplate: function() {
      return this.render('channels/index');
    },
    model: function() {
      return this.store.findQuery('channel');
    },
    actions: {
      refresh: function() {
        return this.refresh();
      }
    }
  });

  Dashboard.ChannelsSearchRoute = Dashboard.ChannelsTabRoute.extend(Dashboard.SearchableRoute, {
    baseRouteName: 'channels',
    resourceName: 'channel'
  });

}).call(this);
(function() {
  Dashboard.ContributionsIndexRoute = Dashboard.AuthenticatedRoute.extend({
    redirect: function() {
      return this.transitionTo('contributions.tab', 'pending');
    }
  });

  Dashboard.ContributionsTabRoute = Dashboard.AuthenticatedRoute.extend({
    breadcrumbs: false,
    title: Ember.I18n.t('titles.contributions.index'),
    renderTemplate: function() {
      return this.render('contributions/index');
    },
    model: function(params) {
      var filter;
      filter = {};
      filter[params['filter']] = true;
      return this.store.findQuery('contribution', filter);
    },
    actions: {
      refresh: function() {
        return this.refresh();
      },
      show: function(contribution) {
        var controller;
        controller = this.controllerFor('contributions.show');
        controller.set('model', contribution);
        return this.render('contributions/show', {
          outlet: 'modal',
          controller: controller
        });
      }
    }
  });

  Dashboard.ContributionsSearchRoute = Dashboard.ContributionsTabRoute.extend(Dashboard.SearchableRoute, {
    baseRouteName: 'contributions',
    resourceName: 'contribution'
  });

}).call(this);
(function() {
  Dashboard.IndexRoute = Dashboard.AuthenticatedRoute.extend({
    title: (function() {
      return Ember.I18n.t('titles.index');
    }).property()
  });

}).call(this);
(function() {
  Dashboard.PressAssetsEditRoute = Dashboard.AuthenticatedRoute.extend({
    title: Ember.I18n.t('titles.press_assets.edit'),
    model: function(params) {
      return this.store.find('press_asset', params['id']);
    }
  });

}).call(this);
(function() {
  Dashboard.PressAssetsNewRoute = Dashboard.AuthenticatedRoute.extend({
    title: Ember.I18n.t('titles.press_assets.new'),
    model: function() {
      return this.store.createRecord('press_asset', {});
    }
  });

}).call(this);
(function() {
  Dashboard.PressAssetsRoute = Dashboard.AuthenticatedRoute.extend({
    breadcrumbs: {
      name: Ember.I18n.t('titles.press_assets.index')
    }
  });

  Dashboard.PressAssetsIndexRoute = Dashboard.AuthenticatedRoute.extend({
    breadcrumbs: false,
    title: Ember.I18n.t('titles.press_assets.index'),
    renderTemplate: function() {
      return this.render('press_assets/index');
    },
    model: function(params) {
      return this.store.findQuery('press_asset', {});
    }
  });

}).call(this);
(function() {
  Dashboard.ProjectsIndexRoute = Dashboard.AuthenticatedRoute.extend({
    redirect: function() {
      return this.transitionTo('projects.tab', 'online');
    }
  });

  Dashboard.ProjectsTabRoute = Dashboard.AuthenticatedRoute.extend({
    breadcrumbs: false,
    title: Ember.I18n.t('titles.projects.index'),
    renderTemplate: function() {
      return this.render('projects/index');
    },
    model: function(params) {
      var filter;
      filter = {
        manageable: true
      };
      filter[params['filter']] = true;
      return this.store.findQuery('project', filter);
    },
    actions: {
      refresh: function() {
        return this.refresh();
      }
    }
  });

  Dashboard.ProjectsSearchRoute = Dashboard.ProjectsTabRoute.extend(Dashboard.SearchableRoute, {
    baseRouteName: 'projects',
    resourceName: 'project'
  });

}).call(this);
(function() {
  Dashboard.SessionsNewRoute = Ember.Route.extend({
    renderTemplate: function() {
      return this.render('sessions/new', {
        outlet: 'login'
      });
    }
  });

}).call(this);
(function() {
  Dashboard.TagsEditRoute = Dashboard.AuthenticatedRoute.extend({
    title: Ember.I18n.t('titles.tags.edit'),
    model: function(params) {
      return this.store.find('tag', params['id']);
    }
  });

}).call(this);
(function() {
  Dashboard.TagsNewRoute = Dashboard.AuthenticatedRoute.extend({
    title: Ember.I18n.t('titles.tags.new'),
    model: function() {
      return this.store.createRecord('tag', {});
    }
  });

}).call(this);
(function() {
  Dashboard.TagsIndexRoute = Dashboard.AuthenticatedRoute.extend({
    redirect: function() {
      return this.transitionTo('tags.tab', 'popular');
    }
  });

  Dashboard.TagsTabRoute = Dashboard.AuthenticatedRoute.extend({
    breadcrumbs: false,
    title: Ember.I18n.t('titles.tags.index'),
    renderTemplate: function() {
      return this.render('tags/index');
    },
    model: function(params) {
      var filter;
      filter = {};
      filter[params['filter']] = true;
      return this.store.findQuery('tag', filter);
    }
  });

}).call(this);
(function() {
  Dashboard.UsersIndexRoute = Dashboard.AuthenticatedRoute.extend({
    redirect: function() {
      return this.transitionTo('users.tab');
    }
  });

  Dashboard.UsersTabRoute = Dashboard.AuthenticatedRoute.extend({
    breadcrumbs: false,
    title: Ember.I18n.t('titles.users.index'),
    renderTemplate: function() {
      return this.render('users/index');
    },
    model: function() {
      return this.store.findQuery('user');
    }
  });

  Dashboard.UsersSearchRoute = Dashboard.UsersTabRoute.extend(Dashboard.SearchableRoute, {
    baseRouteName: 'users',
    resourceName: 'user'
  });

}).call(this);
(function() {
  Dashboard.Router.reopen({
    location: 'history',
    rootURL: '/dashboard/'
  });

  Dashboard.Router.map(function() {
    this.resource('projects', function() {
      this.route('search', {
        path: '/search/*query'
      });
      return this.route('tab', {
        path: '/:filter'
      });
    });
    this.resource('contributions', function() {
      this.route('search', {
        path: '/search/*query'
      });
      return this.route('tab', {
        path: '/:filter'
      });
    });
    this.resource('tags', function() {
      this.route('tab', {
        path: '/:filter'
      });
      this.route('new');
      return this.route('edit', {
        path: '/:id/edit'
      });
    });
    this.resource('press_assets', function() {
      this.route('new');
      return this.route('edit', {
        path: '/:id/edit'
      });
    });
    this.resource('users', function() {
      this.route('tab', {
        path: '/'
      });
      return this.route('search', {
        path: '/search/*query'
      });
    });
    this.resource('channels', function() {
      this.route('tab', {
        path: '/'
      });
      this.route('search', {
        path: '/search/*query'
      });
      this.route('new');
      return this.route('edit', {
        path: '/:id/edit'
      });
    });
    this.route('sessionsNew', {
      path: 'sessions/new'
    });
    return this.route('sessionsDestroy', {
      path: 'sessions/destroy'
    });
  });

}).call(this);
















