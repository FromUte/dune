Dune.Projects = {} if Dune.Projects is undefined

Dune.Projects.modules =-> [Dune.Tabs, Dune.Rewards.Index, Dune.Projects.Show.StatusBar, Dune.Projects.Show.AskQuestion]


Dune.Projects.Show =
  init: Backbone.View.extend
    el: '.project-page'

    initialize: ->

  StatusBar: Backbone.View.extend
    el: '.project-page'

    initialize: ->
      return if this.$el.length is 0
      offset = this.$('.page-main-content').offset()
      offset = offset.top if offset?
      $(window).unbind('scroll')
      $(window).scroll ->
        if $(document).scrollTop() > offset
          this.$('.status-bar').addClass('show')
        else
          this.$('.status-bar').removeClass('show')

  AskQuestion: ->
    if window.location.hash == '#open-new-user-question-modal'
      $('a[data-reveal-id=ask-a-question]').trigger('click')
