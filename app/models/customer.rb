class Customer < ActiveRecord::Base

  has_many  :orders
  has_many  :instruments
  has_many  :carts

end
