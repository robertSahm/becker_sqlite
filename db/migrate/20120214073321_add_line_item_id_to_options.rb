class AddLineItemIdToOptions < ActiveRecord::Migration
  def change
    add_column :options, :line_item_id, :integer
  end
end
