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
  

end


