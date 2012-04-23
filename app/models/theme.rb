class Theme < ActiveRecord::Base
  acts_as_list
  has_and_belongs_to_many :body_types
  has_and_belongs_to_many :options
  has_many :products
  has_many :line_items

end
