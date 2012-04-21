class CreateThemes < ActiveRecord::Migration
  def change
    create_table :themes do |t|
      t.string  :name
      t.string  :finish
      t.string  :body
      t.string  :color
      t.string  :top
      t.string  :neck
      t.string  :headstock
      t.string  :frets
      t.string  :electronics
      t.string  :hardware
      t.decimal :price, precision: 8, scale: 2
      t.timestamps
    end
  end
end
