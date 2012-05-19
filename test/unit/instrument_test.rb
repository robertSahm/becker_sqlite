# == Schema Information
#
# Table name: instruments
#
#  id           :integer         not null, primary key
#  artist_id    :integer
#  customer_id  :integer
#  line_item_id :integer
#  note         :text
#  created_at   :datetime
#  updated_at   :datetime
#

require 'test_helper'

class InstrumentTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
