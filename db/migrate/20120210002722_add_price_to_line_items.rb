class AddPriceToLineItems < ActiveRecord::Migration

  def up
    add_column :line_items, :price, :decimal, precision: 8, scale: 2
    LineItem.all.each do |item|
       product = Product.find(item.product_id)
       item.price = product.price
       item.save
    end
  end

  def down
    remove_column :line_items, :price
  end
end
