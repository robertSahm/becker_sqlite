class OrdersController < ApplicationController
  skip_before_filter :authorize, only: [:create, :new] 

  def index
    @orders = Order.paginate page: params[:page], order: 'created_at desc', per_page: 10
    @page_title = "Orders"
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @orders }
    end
  end

  def show
    @order = Order.find(params[:id])
    @page_title = "Order Show"
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @order }
    end
  end

  def new
    @cart = current_cart
    @page_title = "Order New"
    if @cart.line_items.empty?
      redirect_to controller: 'main', action: 'new', notice: 'Your cart is empty'
      return
    end
    
    @order = Order.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @order }
    end
  end

  def edit
    @page_title = "Order Edit"
    @order = Order.find(params[:id])
  end

  def create
    @order = Order.new(params[:order])
    @order.add_line_items_from_cart(current_cart)

    respond_to do |format|
      if @order.save
        Cart.destroy(session[:cart_id])
        session[:cart_id] = nil
        OrderNotifier.received(@order).deliver
        format.html { redirect_to order_path(@order), notice: 'Thank you for your order!' }
        format.json { render json: @order, status: :created, location: @order }
      else
        @cart = current_cart
        format.html { render action: "new" }
        format.json { render json: @order.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @order = Order.find(params[:id])

    respond_to do |format|
      if @order.update_attributes(params[:order])
        OrderNotifier.shipped(@order).deliver
        format.html { redirect_to @order, notice: 'Order was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @order.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @order = Order.find(params[:id])
    @order.destroy

    respond_to do |format|
      format.html { redirect_to orders_url }
      format.json { head :ok }
    end
  end
end
