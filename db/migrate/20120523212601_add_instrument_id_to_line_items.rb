class AddInstrumentIdToLineItems < ActiveRecord::Migration
  def change
    add_column :line_items, :instrument_id, :integer
  end
end
