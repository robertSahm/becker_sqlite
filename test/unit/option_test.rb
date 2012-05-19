# == Schema Information
#
# Table name: options
#
#  id           :integer         not null, primary key
#  description  :string(255)
#  price        :decimal(, )
#  feature_id   :integer
#  default      :boolean         default(FALSE)
#  display      :boolean         default(TRUE)
#  line_item_id :integer
#  type_of      :string(255)
#

require 'test_helper'

class OptionTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
