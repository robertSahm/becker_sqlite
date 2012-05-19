class AdminsController < ApplicationController
  def index
    @total_orders = Order.count
    @page_title = "Admin"
    @home = true
    if params[:notice] == 'welcome'
      flash[:notice] = "welcome"
    end
  end
  
  def front
    
  end
  
  
  def woodshop
  end
  
  def service
  end
end

