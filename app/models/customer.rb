# == Schema Information
#
# Table name: customers
#
#  id            :integer         not null, primary key
#  username      :string(255)
#  hash_password :string(255)
#  salt          :string(255)
#  ipaddress     :string(255)
#  created_at    :datetime
#  updated_at    :datetime
#

class Customer < ActiveRecord::Base

  has_many  :orders
  has_many  :instruments
  has_many  :carts

end
