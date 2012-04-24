class AddDisplayToThemes < ActiveRecord::Migration
  def change
    add_column :themes, :display, :boolean
  end
end
