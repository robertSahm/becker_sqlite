# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Becker::Application.initialize!

Becker::Application.configure do
  config.action_mailer.delivery_method = :smtp
  
  config.action_mailer.smtp_settings = {
    :address =>   "smtp.gmail.com",
    :port =>     587,
    :domain  =>    "localhost.localdomain",
    :authentication =>      :plain,
    :user_name =>           "programcodex",
    :password =>            "cyclone13",
    :enable_starttls_auto =>    true
  }
end
