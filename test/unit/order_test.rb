# == Schema Information
#
# Table name: orders
#
#  id          :integer         not null, primary key
#  name        :string(255)
#  address     :text
#  email       :string(255)
#  pay_type    :string(255)
#  created_at  :datetime
#  updated_at  :datetime
#  ship_date   :datetime
#  customer_id :integer
#  artist_id   :integer
#  note        :text
#

require 'test_helper'

class OrderTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
