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

require 'test_helper'

class CustomerTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
