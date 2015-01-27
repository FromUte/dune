class Projects::ContributionsController < ApplicationController
  after_filter :verify_authorized, except: :index
  skip_before_filter :set_persistent_warning
  has_scope :available_to_count, type: :boolean
  has_scope :with_state
  has_scope :page, default: 1

  def index
    @project        = parent
    @contributions  = collection
    @active_matches = parent.matches.active
    if request.xhr? && params[:page] && params[:page].to_i > 1
      render collection
    end
  end

  def edit
    @project      = parent
    @contribution = resource
    authorize resource
  end

  def show
    @project      = parent
    @contribution = resource
    authorize resource
  end

  def new
    @project      = parent
    @contribution = ContributionForm.new(project: parent, user: current_user)
    authorize @contribution

    @rewards = [empty_reward] + @project.rewards.not_soon.remaining.order(:minimum_value)

    if params[:reward_id] && (selected_reward = @project.rewards.not_soon.find(params[:reward_id])) && !selected_reward.sold_out?
      @contribution.reward = selected_reward
      @contribution.value = "%0.0f" % selected_reward.minimum_value
    end
  end

  def create
    @project      = parent
    @contribution = ContributionForm.new(permitted_params[:contribution_form].
                                     merge(user: current_user,
                                           project: parent))

    @contribution.reward_id = nil if params[:contribution_form][:reward_id].to_i == 0
    authorize @contribution

    if @contribution.save
      session[:thank_you_contribution_id] = @contribution.id
      flash.delete(:notice)
      redirect_to edit_project_contribution_path(project_id: @project, id: @contribution.id)
    else
      flash.alert = t('controllers.projects.contributions.create.error')
      redirect_to new_project_contribution_path(@project)
    end
  end

  def credits_checkout
    @contribution = resource
    authorize resource
    if current_user.credits < @contribution.value
      flash.alert = t('controllers.projects.contributions.credits_checkout.no_credits')
      return redirect_to new_project_contribution_path(@contribution.project)
    end

    unless @contribution.confirmed?
      @contribution.update_attributes({ payment_method: 'Credits' })
      @contribution.confirm!
    end

    flash.notice = t('controllers.projects.contributions.credits_checkout.success')
    redirect_to project_contribution_path(parent, resource)
  end

  protected

  def permitted_params
    params.permit(policy(@contribution || ContributionForm).permitted_attributes)
  end

  def collection
    @contributions ||= apply_scopes(parent.contributions).available_to_display.where(matching_id: nil).order("confirmed_at DESC").per(10)
  end

  def empty_reward
    Reward.new(minimum_value: 0, description: t('controllers.projects.contributions.new.no_reward'))
  end

  def parent
    @parent ||= Project.find_by_permalink!(params[:project_id])
  end

  def resource
    @resource ||= parent.contributions.find(params[:id])
  end
end
