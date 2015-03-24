require 'spec_helper'

describe Project::OrganizationType do
  it { expect(Project.organization_types).to eq [:celibataire, :mariee, :pacs, :indivision, :municipality, :sci, :neighborhood_organization, :registered_nonprofit, :other, :not_sure] }
  it { expect(Project.organization_type_array.size).to eq Project.organization_types.size }
end
