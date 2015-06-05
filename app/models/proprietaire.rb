class Proprietaire < ActiveRecord::Base
  belongs_to :project

  validates :nom, :prenom, :date_naissance, :lieu_naissance, :situation_famille, :profession, :anciennete_profession, :salaire_net, :type_contrat, :autres_revenus, presence: true

  def contrat?
    type_contrat.eql? 'autre'
  end
end
