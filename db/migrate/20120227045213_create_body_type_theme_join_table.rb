class CreateBodyTypeThemeJoinTable < ActiveRecord::Migration
  def up
    create_table :body_types_themes, id: false do |t|
      t.integer :body_type_id
      t.integer :theme_id
    end
      
  end

  def down
    drop_table :body_types_themes
  end
end
