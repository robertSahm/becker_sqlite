class AddImageUrlToFeatures < ActiveRecord::Migration
  def change
    add_column :features, :image_url, :string
  end
end
