# == Schema Information
#
# Table name: line_items
#
#  id           :integer         not null, primary key
#  product_id   :integer
#  cart_id      :integer
#  created_at   :datetime
#  updated_at   :datetime
#  quantity     :integer         default(1)
#  price        :decimal(8, 2)
#  order_id     :integer
#  body_type_id :integer
#  theme_id     :integer
#

require 'test_helper'

class LineItemTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
