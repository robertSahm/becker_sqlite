class AddXImageUrlToProducts < ActiveRecord::Migration
  def change
    add_column :products, :x_image_url, :string
  end
end
