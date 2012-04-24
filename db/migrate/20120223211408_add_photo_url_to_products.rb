class AddPhotoUrlToProducts < ActiveRecord::Migration
  def change
    add_column :products, :photo_url_1, :string
    add_column :products, :photo_url_2, :string
    add_column :products, :photo_url_3, :string
    add_column :products, :photo_url_4, :string
    add_column :products, :photo_url_5, :string
    add_column :products, :photo_url_6, :string
    add_column :products, :photo_url_7, :string
    add_column :products, :photo_url_8, :string
  end
end
