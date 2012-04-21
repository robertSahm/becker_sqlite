class Cart < ActiveRecord::Base
  has_many    :line_items, dependent: :destroy
  belongs_to  :customer
  
  def add_product(id, price)
    current_item = line_items.find_by_product_id(id)
    if current_item
      current_item.quantity += 1
    else
      current_item = line_items.build(product_id: id, price: price)
    end
    current_item
  end
  

  def total_price
    line_items.to_a.sum { |item| item.total_price}
  end
end
