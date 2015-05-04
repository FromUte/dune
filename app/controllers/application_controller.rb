class ApplicationController < ActionController::Base
  include Concerns::ExceptionHandler
  include Concerns::SocialHelpersHandler
  include Concerns::PersistentWarnings
  include Concerns::AuthenticationHandler
  include Pundit

  protect_from_forgery

  helper_method :channel, :referral_url
  before_action :ensure_domain, :referral_it!

  before_filter do
    if current_user and (current_user.email =~ /change-your-email\+[0-9]+@dune-investissement\.fr/)
      redirect_to set_email_users_path unless controller_name =~ /users|confirmations/
    end
  end

  def channel
    Channel.find_by_permalink(request.subdomain.to_s)
  end

  def referral_url
    session[:referral_url]
  end

  private

  def referral_it!
    session[:referral_url] = params[:ref] if params[:ref].present?
  end

  # Redirect to the appropriate domain i.e. example.com
  def ensure_domain
    unless Rails.env.development?
    domain_to_redirect_to = 'dune-investissement-solidaire.fr'
    domain_exceptions = ['www.dune-investissement-solidaire.fr','dune-investissement.herokuapp.com']
    should_redirect = !(domain_exceptions.include? request.host)
    new_url = "#{request.protocol}#{domain_to_redirect_to}#{request.fullpath if request.fullpath != '/'}"
    redirect_to new_url, status: :moved_permanently if should_redirect
    end
  end

end
