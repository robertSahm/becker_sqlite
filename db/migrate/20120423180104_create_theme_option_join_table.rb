class CreateThemeOptionJoinTable < ActiveRecord::Migration
  def up
    create_table :options_themes, id: false do |t|
      t.integer :option_id
      t.integer :theme_id
    end

  end

  def down
    drop_table :options_themes
  end
end
