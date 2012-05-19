class AdminsController < ApplicationController
  def index
    @total_orders = Order.count
    @page_title = "Admin"
    @home = true
    @orders = Order.paginate page: params[:page], order: 'created_at desc', per_page: 10
    if params[:notice] == 'welcome'
      flash[:notice] = "welcome"
    end
  end
  
  def front
    @users = User.all
  end
  
  
  def woodshop
  end
  
  def service
  end
end

