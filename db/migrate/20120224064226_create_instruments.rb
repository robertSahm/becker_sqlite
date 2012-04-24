class CreateInstruments < ActiveRecord::Migration
  def change
    create_table  :instruments do |t|
      t.integer   :artist_id
      t.integer   :customer_id
      t.integer   :line_item_id
      t.text      :note
      t.timestamps
    end
  end
end
