class OrderNotifier < ActionMailer::Base
  default from: "programcodex@gmail.com"

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.order_notifier.received.subject
  #
  def received(order)
    @order = order
    mail to: order.email, :subject => "Thank you for Ordering a Becker Custom Built Instrument!"
  end

  def shipped(order)
    @order = order
    mail to: order.email, subject: "Your Becker Instrument has shipped!"
  end
  
  def error_occured(error)
    @error = error
    mail to: :from, :subject => "Becker site error occured"
  end
end
