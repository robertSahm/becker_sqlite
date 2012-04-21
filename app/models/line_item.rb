class LineItem < ActiveRecord::Base

  belongs_to  :order
  belongs_to  :product
  belongs_to  :cart
  has_many    :options
  belongs_to  :theme
  belongs_to  :body_type
  

  
  def total_price
    product.price * quantity
    # if similar products are added at different prices, this will not work
    # you would have to put some - best price type code here ie
      # your price has improved , we will update the other items in your cart
      # the price on this object has been raised , we can no longer offer it at your previous price
      # or the price on this object has gone up , but we will honor your previous lower price
  end
end
