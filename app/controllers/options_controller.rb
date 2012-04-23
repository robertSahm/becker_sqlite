class OptionsController < ApplicationController

  def show
    @options = Option.order("options.product_id ASC").order("options.feature_id ASC").order("options.price ASC")
    @feat = feature_hash
    @prod = product_hash
    # @feature = Feature.order("position ASC")
    # @products = Product.order("position ASC")
    
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @options }
    end
  end

  def index
    # @option = Option.find(params[:id])
    @options = Option.order("options.product_id ASC").order("options.feature_id ASC").order("options.price ASC")
    @body_types = BodyType.all
    @themes     = Theme.all
    @products   = Product.all
    @feature_array = feature_array_id_name
    @product_array = product_array_id_name
    @theme_array   = theme_array_id_name
    @body_type_array = body_type_array_id_name
    
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @option }
    end
  end

  def new(product=nil)
    @option   = Option.new(product)
    @themes   = Theme.all
    @products = Product.all
    @body_types = BodyType.all
    @feat = feature_array
    @prod = product_array
    
    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @option }
    end
  end

  def edit
    @option = Option.find(params[:id])
    @body_types = BodyType.all
    @themes = Theme.all
    @products = Product.all
    @feat = feature_array
    @prod = product_array
  end

  def create
    @option = Option.new(params[:option])

    respond_to do |format|
      if @option.save
        format.html { redirect_to @option, notice: 'Option was successfully created.' }
        format.json { render json: @option, status: :created, location: @option }
      else
        format.html { render action: "new" }
        format.json { render json: @option.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @option = Option.find(params[:id])

    respond_to do |format|
      if @option.update_attributes(params[:option])
        format.html { redirect_to options_path, notice: 'Option was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @option.errors, status: :unprocessable_entity }
      end
    end
  end

  def delete
    @option = Option.find(params[:id])
    @option.destroy

    respond_to do |format|
      format.html { redirect_to options_url }
      format.json { head :ok }
    end
  end
end
