# == Schema Information
#
# Table name: body_types
#
#  id          :integer         not null, primary key
#  name        :string(255)
#  description :text
#  image_url   :string(255)
#  x_image_url :string(255)
#  position    :integer
#  type_of     :string(255)
#  price       :decimal(, )
#  created_at  :datetime
#  updated_at  :datetime
#  display     :boolean
#

require 'test_helper'

class BodyTypeTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
