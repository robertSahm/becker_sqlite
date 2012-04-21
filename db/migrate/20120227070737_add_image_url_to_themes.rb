class AddImageUrlToThemes < ActiveRecord::Migration
  def change
    add_column :themes, :image_url,   :string
    add_column :themes, :x_image_url, :string
    add_column :themes, :thumb_url,   :string
  end
end
