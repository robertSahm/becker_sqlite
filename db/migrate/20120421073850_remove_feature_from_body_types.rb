class RemoveFeatureFromBodyTypes < ActiveRecord::Migration
  def up
    remove_column :body_types, :feature
  end
  
  def down
    add_column :body_types, :feature, :string    
  end
end
