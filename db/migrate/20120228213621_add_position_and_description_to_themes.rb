class AddPositionAndDescriptionToThemes < ActiveRecord::Migration
  def change
    add_column :themes, :position, :integer
    add_column :themes, :description, :text
  end
end
