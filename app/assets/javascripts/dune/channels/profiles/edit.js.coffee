Dune.Channels ?= {}
Dune.Channels.Profiles ?= {}

Dune.Channels.Profiles.Edit =
  init: Backbone.View.extend
    el: '.edit-channel-page'

    initialize: ->
      this.$('#profile_how_it_works, #profile_submit_your_project_text').markItUp(Dune.markdownSettings)
