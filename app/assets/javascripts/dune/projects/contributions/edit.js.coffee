Dune.Projects = {} if Dune.Projects is undefined
Dune.Projects.Contributions = {} if Dune.Projects.Contributions is undefined

Dune.Projects.Contributions.Edit =
  modules: -> [Dune.CustomTooltip]
  init: Backbone.View.extend
    el: '.create-contribution-page'

    events:
      'click .faqs a': 'openFaqText'

    initialize: ->
      @payment_view = new Dune.Payment()
      $('#pay_payment_fees').on 'change', =>
        @payment_view.togglePaymentFee()
      @payment_view.togglePaymentFee()

    openFaqText: (e)->
      e.preventDefault()
      $(e.currentTarget).parent().find('p').toggleClass('hide')
