# == Schema Information
#
# Table name: checkouts
#
#  id              :integer         not null, primary key
#  first_name      :string(255)
#  last_name       :string(255)
#  phone           :string(255)
#  email           :string(255)
#  company         :string(255)
#  address         :text
#  city            :string(255)
#  state           :string(255)
#  country         :string(255)     default("US")
#  zip_code        :string(255)
#  first_name_ship :string(255)
#  last_name_ship  :string(255)
#  company_ship    :string(255)
#  address_ship    :text
#  city_ship       :string(255)
#  state_ship      :string(255)
#  country_ship    :string(255)     default("US")
#  zip_code_ship   :string(255)
#  delivery_type   :string(255)
#  ship_date       :datetime
#  customer_id     :integer
#  artist_id       :integer
#  product_id      :integer
#  note            :text
#  pay_type        :string(255)
#  created_at      :datetime
#  updated_at      :datetime
#

class Checkout < ActiveRecord::Base
  attr_writer :current_step

  # validates_presence_of :shipping_name, :if => lambda { |o| o.current_step == "shipping" }
  # validates_presence_of :billing_name, :if => lambda { |o| o.current_step == "billing" }

  def current_step
    @current_step || steps.first 
  end
  
  def steps
    %w[ checkout_method billing_info shipping_info shipping_method payment_method order_review  ]   
  end
  
  def next_step
    self.current_step = steps[steps.index(current_step)+1]   
  end
  
  def previous_step
    self.current_step = steps[steps.index(current_step)-1]      
  end
  
  def first_step?
    current_step == steps.first
  end

  def last_step?
    current_step == steps.last
  end
  
  def all_valid?
    steps.all? do |step|
      self.current_step = step
      valid?
    end
  end
end
