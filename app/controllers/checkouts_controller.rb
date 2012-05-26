class CheckoutsController < ApplicationController

  def index
    @checkouts = Checkout.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @checkouts }
    end
  end

  def show
    @checkout = Checkout.find(params[:id])
     session[:checkout_step] = session[:checkout_params] = nil
    
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @checkout }
    end
  end

  def new
    session[:checkout_params] ||= {}
    @cart = current_cart
    @checkout = Checkout.new(session[:checkout_params])
    @checkout.current_step = session[:order_step]
    @page_title = "New Checkout"

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
    @checkout = Checkout.find(params[:id])
  end

  def create
    @cart = current_cart
    session[:checkout_params].deep_merge!(params[:checkout]) if params[:checkout]
    @checkout = Checkout.new(session[:checkout_params])
    @checkout.current_step = session[:checkout_step]
    if @checkout.valid?
      if params[:name] == 'back_button'
        @checkout.previous_step
      elsif @checkout.last_step?
        @checkout.save if @checkout.all_valid?
      else
        @checkout.next_step
      end
    end
    session[:checkout_step] = @checkout.current_step
    if @checkout.new_record?
      render "new"
    else
      session[:checkout_step] = session[:checkout_params] = nil
      flash[:notice] = "Checkout Complete!"
      redirect_to @checkout
    end
  end

  def update
    @checkout = Checkout.find(params[:id])

    respond_to do |format|
      if @checkout.update_attributes(params[:checkout])
        format.html { redirect_to @checkout, notice: 'Checkout was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @checkout.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @checkout = Checkout.find(params[:id])
    @checkout.destroy

    respond_to do |format|
      format.html { redirect_to checkouts_url }
      format.json { head :ok }
    end
  end
end
