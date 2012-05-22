class AddBodyTypeIdToFeature < ActiveRecord::Migration
  def change
    add_column :features, :category, :string
    add_column :features, :type, :string
  end
end
