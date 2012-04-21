class AddDisplayToBodyTypes < ActiveRecord::Migration
  def change
    add_column :body_types, :display, :boolean
  end
end
