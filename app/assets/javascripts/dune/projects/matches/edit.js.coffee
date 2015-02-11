Dune.Projects ?= {}
Dune.Projects.Matches ?= {}

Dune.Projects.Matches.Edit =
  modules: -> [Dune.CustomTooltip]

  init: Backbone.View.extend
    el: '.edit-match-page'

    initialize: ->
      this.$('.payment-method-option-balanced-bankaccount').insertBefore(
        this.$('.payment-method-option-balanced-creditcard')
      )
      @payment_view = new Dune.Payment()
      @payment_view.togglePaymentFee()
