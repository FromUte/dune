begin
  ActionMailer::Base.default 'Content-Transfer-Encoding' => 'quoted-printable'

  if Rails.env.production?
    ActionMailer::Base.smtp_settings = {
        address: 'smtp.mandrillapp.com',
        port: '587',
        authentication: :plain,
        user_name: Configuration[:MANDRILL_USERNAME],
        password: Configuration[:MANDRILL_APIKEY],
        domain: 'www.dune-investissement-solidaire.fr'
    }
    ActionMailer::Base.delivery_method = :smtp
  end
rescue
  nil
end