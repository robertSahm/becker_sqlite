class AddFeatureToProducts < ActiveRecord::Migration
  def change
    add_column :products, :feature, :string
  end
end
