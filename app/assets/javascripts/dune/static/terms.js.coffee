Dune.Static ?= {}

Dune.Static.Learn =
  init: Backbone.View.extend
    el: '.terms-page'

    initialize: ->
      if window.innerWidth > 700
        $(".bs-affix").stick_in_parent