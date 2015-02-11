Dune.Projects = {} if Dune.Projects is undefined
Dune.Projects.Contributions = {} if Dune.Projects.Contributions is undefined

Dune.Projects.Contributions.Index =
  init: Backbone.View.extend _.extend(
    el: '.contributions-page'

    initialize: ->
      this.use_custom_append = true
      Dune.CustomTooltip()
      this.$loader = this.$('.contributions-loading img')
      this.$loaderDiv = this.$('.contributions-loading')
      this.$results = this.$('.list')
      this.path = this.$el.data('path')
      this.filter = { page: 2 }
      this.setupScroll()

      this.$('.js-load-more').click =>
        this.fetchPage()
        return false

      this.$masonry = this.masonry()
      this.$el.on 'scroll:success', (event, data) =>
        Dune.CustomTooltip()
        $data = $(data).filter('div')
        this.$('.list').append $data
        this.$('.list').masonry('appended', $data)

    masonry: ->
      this.$('.list').masonry ->
        itemSelector: '.contribution-wrapper'

    , Dune.InfiniteScroll)
