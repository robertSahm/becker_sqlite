class AddKeysToOptions < ActiveRecord::Migration
  def change
    add_column :options, :theme_id, :integer
    add_column :options, :body_type_id, :integer
  end
end
