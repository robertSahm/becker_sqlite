class AddKeysToProducts < ActiveRecord::Migration
  def change
    add_column :products, :theme_id, :integer
    add_column :products, :body_type_id, :integer
    add_column :products, :display, :boolean
  end
end
