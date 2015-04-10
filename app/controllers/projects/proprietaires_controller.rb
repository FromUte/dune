class Projects::ProprietairesController < ApplicationController
  after_filter :verify_authorized, except: :index
  inherit_resources
  defaults resource_class: Project, collection_name: :proprietaires

  actions :index, :create, :destroy
  belongs_to :project, finder: :find_by_permalink!

  def index
    @project = parent
  end

  def create
    @proprietaire = Proprietaire.new(permitted_params[:proprietaire].merge(project: parent))
    authorize @proprietaire
    create! { project_proprietaires_path(parent) }
  end

  def destroy
    authorize resource
    destroy! { project_proprietaires_path(parent) }
  end

  private
  def permitted_params
    params.permit(policy(@proprietaire || Proprietaire).permitted_attributes)
  end

  def collection
    @proprietaires ||= end_of_association_chain.order('created_at desc')
  end
end
