Dune.Projects = {} if Dune.Projects is undefined
Dune.Projects.Updates = {} if Dune.Projects.Updates is undefined

Dune.Projects.Updates.Index =
  init: Backbone.View.extend _.extend(
    el: '.updates'
    events:
      "ajax:success form#new_update": "onCreate"
      "ajax:success .update": "onDestroy"

    onCreate: (e, data) ->
      this.$('.new_update').trigger('reset')
      @$results.prepend data
      this.parseXFBML()

    onDestroy: (e)->
      $(e.currentTarget).remove()

    initialize: ->
      this.$('#update_comment').markItUp(Dune.markdownSettings)
      _.bindAll(this, 'parseXFBML')
      this.$loader = this.$('.updates-loading img')
      this.$loaderDiv = this.$('.updates-loading')
      this.$results = this.$('.list')
      this.path = this.$el.data('path')
      this.filter = { page: 2 }
      this.setupScroll()
      this.$el.on 'scroll:success', this.parseXFBML

      this.$('.js-load-more').click =>
        this.fetchPage()
        return false

    parseXFBML: ->
      FB.XFBML.parse() if this.$el.is(":visible")

    , Dune.InfiniteScroll)
