Dune.Static ?= {}

Dune.Static.Terms =
  init: Backbone.View.extend
    el: '.terms-page'

    initialize: ->
      if window.innerWidth > 700
        $(".bs-affix").stick_in_parent