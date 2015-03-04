require 'spec_helper'

describe Project::OrganizationType do
  it { expect(Project.organization_types).to eq [:sarl, :sa, :eurl, :sas, :municipality, :neighborhood_organization, :registered_nonprofit, :public_private_partnership, :other, :not_sure] }
  it { expect(Project.organization_type_array.size).to eq Project.organization_types.size }
end
