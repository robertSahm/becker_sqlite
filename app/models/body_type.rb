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

class BodyType < ActiveRecord::Base
  acts_as_list
  has_and_belongs_to_many :themes
  has_many :products
  has_and_belongs_to_many :options
  has_many :line_items
  has_and_belongs_to_many :features
  

end
