class Option < ActiveRecord::Base

  belongs_to :feature
  belongs_to :product
  belongs_to :line_item
  belongs_to :themes
  belongs_to :body_types

  validates :description, :price, :feature_id,  presence: true
end
