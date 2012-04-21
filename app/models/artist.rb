class Artist < ActiveRecord::Base
  acts_as_list
  has_many :instruments

end
