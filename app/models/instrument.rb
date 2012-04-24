class Instrument < ActiveRecord::Base

  belongs_to :artist
  belongs_to :customer
  belongs_to :line_item



end
