# == Schema Information
#
# Table name: features
#
#  id          :integer         not null, primary key
#  name        :string(255)
#  position    :integer
#  description :string(255)
#

class Feature < ActiveRecord::Base
  acts_as_list
  has_many :options
  has_and_belongs_to_many :body_types
  
  FEATURE_TYPES = [ 'wood' , 'paint' , 'neck' , 'electronics' , 'accessories' ]
end


