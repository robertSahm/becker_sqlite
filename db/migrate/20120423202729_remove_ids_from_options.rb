class RemoveIdsFromOptions < ActiveRecord::Migration
  def up
    remove_column :options, :body_type_id
    remove_column :options, :theme_id
    remove_column :options, :product_id 
  end
  
  def down
    add_column :options, :body_type_id, :integer
    add_column :options, :theme_id, :integer
    add_column :options, :product_id, :integer
  end
end
