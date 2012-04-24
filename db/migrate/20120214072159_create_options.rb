class CreateOptions < ActiveRecord::Migration
  def change
    create_table :options do |t|
      t.string  :description
      t.decimal :price
      t.integer :feature_id
      t.integer :product_id
      t.boolean :default,   :default => false
      t.boolean :display,   :default => true
    end
  end
end
