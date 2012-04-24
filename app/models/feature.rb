class Feature < ActiveRecord::Base
  acts_as_list
  has_many :options
  

end


