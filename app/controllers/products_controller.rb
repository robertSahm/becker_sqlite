class ProductsController < ApplicationController

  def index
    @instrument = params[:instrument]
    if @instrument
      @products = Product.where(type_of: @instrument).order("products.position ASC")
    else
      @products = Product.all
    end
    @features = Feature.all
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @products }
      # mobil
      # iPad
    end
  end


  def show
    @product = Product.find(params[:id])
    @page_title = "Product Show Detail"
    @feat = feature_hash
    @prod = product_hash
    @options = Option.where(display: true).order("options.feature_id ASC").order("options.price ASC")
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @product }
    end
  end

  def new
    @product = Product.new
    @page_title = "Product New"
    @options = Option.order("options.feature_id ASC").order("options.price ASC")
    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @product }
    end
  end

  def edit
    @page_title = "Product Edit"
    @product = Product.find(params[:id])
    @feat = feature_hash
    @prod = product_hash
    @options = Option.where(display: true).order("options.feature_id ASC").order("options.price ASC")
  end

  def create
    @product = Product.new(params[:product])

    respond_to do |format|
      if @product.save
        format.html { redirect_to @product, notice: 'Product was successfully created.' }
        format.json { render json: @product, status: :created, location: @product }
      else
        format.html { render action: "new" }
        format.json { render json: @product.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @product = Product.find(params[:id])

    respond_to do |format|
      if @product.update_attributes(params[:product])
        format.html { redirect_to @product, notice: 'Product was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @product.errors, status: :unprocessable_entity }
      end
    end
  end
  
  def sort
    params[:product].each_with_index do |id, index|
      Product.update_all({position: index}, {id: id})
    end
    render nothing: true
  end

  def delete
    @product = Product.find(params[:id])
    @product.destroy

    respond_to do |format|
      format.html { redirect_to products_url }
      format.json { head :ok }
    end
  end
  
  def who_bought
    @product = Product.find(params[:id])
    respond_to do |format|
      format.atom
    end
  end
end
