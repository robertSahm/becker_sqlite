# == Schema Information
#
# Table name: themes
#
#  id          :integer         not null, primary key
#  name        :string(255)
#  finish      :string(255)
#  body        :string(255)
#  color       :string(255)
#  top         :string(255)
#  neck        :string(255)
#  headstock   :string(255)
#  frets       :string(255)
#  electronics :string(255)
#  hardware    :string(255)
#  price       :decimal(8, 2)
#  created_at  :datetime
#  updated_at  :datetime
#  image_url   :string(255)
#  x_image_url :string(255)
#  thumb_url   :string(255)
#  position    :integer
#  description :text
#  display     :boolean
#

require 'test_helper'

class ThemeTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
