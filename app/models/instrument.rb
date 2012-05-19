# == Schema Information
#
# Table name: instruments
#
#  id           :integer         not null, primary key
#  artist_id    :integer
#  customer_id  :integer
#  line_item_id :integer
#  note         :text
#  created_at   :datetime
#  updated_at   :datetime
#

class Instrument < ActiveRecord::Base

  belongs_to :artist
  belongs_to :customer
  belongs_to :line_item



end
