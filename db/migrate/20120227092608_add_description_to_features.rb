class AddDescriptionToFeatures < ActiveRecord::Migration
  def change
    add_column :features, :description, :string
  end
end
