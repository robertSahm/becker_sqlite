class Option < ActiveRecord::Base

  belongs_to :feature
  belongs_to :line_item
  has_and_belongs_to_many :themes
  has_and_belongs_to_many :body_types
  has_and_belongs_to_many :products
  
  
  validates :description, :price, :feature_id,  presence: true
end
