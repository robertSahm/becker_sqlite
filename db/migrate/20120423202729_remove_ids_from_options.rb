class RemoveIdsFromOptions < ActiveRecord::Migration
  def change
    remove_column :options, :body_type_id, :integer
    remove_column :options, :theme_id, :integer
    remove_column :options, :product_id, :integer
  end
end
