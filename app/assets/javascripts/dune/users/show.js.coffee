Dune.Users = {} if Dune.Users is undefined


Dune.Users.Show =
  init: Backbone.View.extend
    el: '.user-profile-page'

    initialize: ->
      if this.$('.map-canvas').length > 0
        this.map = new Dune.Map()
