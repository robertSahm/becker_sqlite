class LineItemsController < ApplicationController
  skip_before_filter :athorize, only: :create
  
  def index
    @line_items = LineItem.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @line_items }
    end
  end

  def show
    @line_item = LineItem.find(params[:product_id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @line_item }
    end
  end

  def new
    @line_item = LineItem.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @line_item }
    end
  end

  def edit
    @line_item = LineItem.find(params[:product_id])
  end

  def create
    @cart = current_cart          #defined in application controller
    if params[:product_id].nil?
      # !! work around
      # save a product with the body_type and theme and the options
      # display: false
      # then create that product in the line items here
      product = Product.first
      
      # work around !!
    else
      product = Product.find(params[:product_id])
    end
    @line_item = @cart.add_product(product.id, product.price)   # defined in cart.rb model

    respond_to do |format|
      if @line_item.save
        format.html { redirect_to controller: 'carts', action: 'show', id: @cart.id }
        format.js { @current_item = @line_item }
        format.json { render json: @line_item, status: :created, location: @line_item }
      else
        format.html { render action: "new" }
        format.json { render json: @line_item.errors, status: :unprocessable_entity }
      end
    end
  end

  def update(line_item=nil)
    if line_item.nil?
      @line_item = LineItem.find(params[:id])
    else
      @line_item = line_item
    end
    amount = params[:amount]
    @line_item.quantity += amount.to_i
    if  @line_item.quantity < 0 
      @line_item.quantity = 0
    end
    @cart = current_cart          #defined in application controller


    respond_to do |format|
      if @line_item.update_attributes(params[:line_item])
        format.html { redirect_to @line_item, notice: 'Line item was successfully updated.' }
        format.js  
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @line_item.errors, status: :unprocessable_entity }
      end
    end
  end
    
  def increment(line_item, amount)
    @line_item = LineItem.find(params[:id])
    @line_item.quantity += amount
    quantity = @line_item.quantity
    @line_item.update_attributes(:quantity => 50)
    update(@line_item)
  end
  
  def decrement(line_item)
    @line_item = LineItem.find(params[:id])
    @line_item.quantity -= 1
    update(@line_item)
  end

  def destroy
     @line_item = LineItem.find(params[:id])
     id = params[:id]
     @cart = current_cart          #defined in application controller
     @selector = ".line_item#{id}"
     @line_item.destroy

     respond_to do |format|
       format.html { redirect_to @cart }
       format.js 
       format.xml  { head :ok }
     end
  end
end