Dune.Static ?= {}

Dune.Static.Faq =
  init: Backbone.View.extend
    el: '.faq-page'

    initialize: ->
      if window.innerWidth > 700
        $(".bs-affix").stick_in_parent