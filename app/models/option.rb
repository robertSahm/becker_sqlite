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

class Option < ActiveRecord::Base

  belongs_to :feature
  belongs_to :line_item
  has_and_belongs_to_many :themes
  has_and_belongs_to_many :body_types
  has_and_belongs_to_many :products
  
  
  validates :description, :price, :feature_id,  presence: true
end
