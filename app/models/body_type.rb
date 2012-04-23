class BodyType < ActiveRecord::Base
  acts_as_list
  has_and_belongs_to_many :themes
  has_many :products
  has_and_belongs_to_many :options
  has_many :line_items
  

end
