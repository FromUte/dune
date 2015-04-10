class ProprietairePolicy < ApplicationPolicy
  include ProjectInheritedPolicyHelpers

  def permitted_attributes
    { proprietaire: record.attribute_names.map(&:to_sym) }
  end
end
