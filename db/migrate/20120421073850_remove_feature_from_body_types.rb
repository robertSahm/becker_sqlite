class RemoveFeatureFromBodyTypes < ActiveRecord::Migration
  def change
    remove_column :body_types, :feature, :string
  end
end
