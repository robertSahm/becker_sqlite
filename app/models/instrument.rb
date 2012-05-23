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
  attr_writer :current_step
  
  belongs_to  :artist
  belongs_to  :customer
  has_many    :line_items
  belongs_to  :body_type
  has_many    :orders, through: :line_items

  def current_step
    @current_step || steps.first 
  end
  
  def steps
    [ 'wood' , 'paint' , 'neck', 'electronics' , 'accessories' ]   
  end
  
  def next_step
    self.current_step = steps[steps.index(current_step)+1]
  end

end
