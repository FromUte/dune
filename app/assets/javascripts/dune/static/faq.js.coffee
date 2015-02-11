Dune.Static ?= {}

Dune.Static.Learn =
  init: Backbone.View.extend
    el: '.learn-page'

    initialize: ->
      $(".bs-affix").stick_in_parent