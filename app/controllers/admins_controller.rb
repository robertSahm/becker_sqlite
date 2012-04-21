class AdminsController < ApplicationController
  def index
    @total_orders = Order.count
    @page_title = "Admin"
  end
  
  def front
    
  end
end

