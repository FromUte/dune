module Project::OrganizationType
  extend ActiveSupport::Concern

  included do
    class << self
      def organization_type_array
        organization_types.collect { |type| [I18n.t("project.organization_type.#{type}"), type] }
      end

      def organization_types
        [:celibataire, :mariee, :pacs, :indivision, :sci, :municipality, :neighborhood_organization, :registered_nonprofit,:other, :not_sure]
      end
    end
  end
end
