class AddKeysToLineItems < ActiveRecord::Migration
  def change
    add_column :line_items, :body_type_id, :integer
    add_column :line_items, :theme_id, :integer
  end
end
