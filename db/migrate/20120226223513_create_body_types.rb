class CreateBodyTypes < ActiveRecord::Migration
  def change
    create_table :body_types do |t|
      t.string  :name
      t.text    :description
      t.string  :image_url
      t.string  :x_image_url
      t.integer :position
      t.string  :feature
      t.string  :type_of
      t.decimal :price, precision: 8, scale: 2
      t.timestamps
    end
  end
end
