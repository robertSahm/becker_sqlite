Order.transaction do
  (1..100).each do |i|
    instruments = []
    x = 0
    @order = Order.create(:name => "Customer#{i}", :address => "#{i} Main Street", :email => "customer-#{i}@ample.com", :pay_type => "Check")
    Product.all.each do |instr|
      instruments << instr.id
      x += 1
    end
    choice = rand(4) + 1
    choice.times do |q|
      number = rand(x)
      @line_item = LineItem.new
      item_num = instruments[number]
      item = Product.find(item_num)
      @line_item.product_id = item.id
      @line_item.price = item.price
      @line_item.order_id = @order.id
      @line_item.save
      puts @line_item

      # what if there are multiple quantity of items ??

    end
  end
end
