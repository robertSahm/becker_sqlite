class CreateProductOptionJoinTable < ActiveRecord::Migration
  def up
    create_table :options_products, id: false do |t|
      t.integer :option_id
      t.integer :product_id
    end

  end

  def down
    drop_table :options_products
  end
end
