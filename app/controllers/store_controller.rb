class StoreController < ApplicationController
  skip_before_filter :authorize

  def new
    if params[:instrument]
      @products  = BodyType.where(type_of: params[:instrument]).order("position ASC")
      @type_of      = [params[:instrument]]
    else
      @type_of      = TYPE_OF
      @products     = BodyType.order("position ASC")
    end
  end
  
  def theme
    @theme = Theme.find(params[:id])
    @body_types = @theme.body_types
    @type_of = [@body_types.first.type_of]
    # prep to get instrument if necessary 
    # prep to get body_types from themes @theme.body_types
    
    
  end

  def themes
    @body_type = BodyType.find(params[:id])
    # a list of all the available themes and related pictures 
    # pictures should be of the actual body types, but for now maybe not possible
    
  end
  
  def index
    if params[:instrument]
      @products = Product.where(type_of: params[:instrument]).order("products.position ASC")
    else
      @products = Product.order(:name)
    end
    @cart = current_cart
    @page_title = "Main store"
  end

  
  def build
    @product  = Product.find(params[:id])
    @prod     = product_hash
    @options  = Option.where(product_id: @product.id, display: true).order("options.feature_id ASC").order("options.price ASC")
    @features = cart_builder(@options)
  end
  
  def edit
    @product  = Product.find(params[:id])
    @features = Feature.all
    @feat     = feature_hash
    @prod     = product_hash
    @options  = Option.where(product_id: @product.id).order("options.feature_id ASC").order("options.price ASC")
    @feature_list = @options.collect do |option|
      option.feature_id
    end
    @feature_list.uniq!
  end

  def show
    @body_type = BodyType.find(params[:body_type])
    @theme     = Theme.find(params[:theme]).
    @options   = Option.where(display: true).order("options.feature_id ASC").order("options.price ASC")
    @features  = cart_builder(@options)
    @cart_total = @body_type.price
  end
  
  def cart_builder(options)
    feature_ids = options.collect do |option|
          option.feature_id
    end
    feature_ids.uniq!
    Feature.where(id: feature_ids).order("position ASC")
  end

  def dynamo
    if  true # previous cart variable is present no need to run this 
      @body_type = BodyType.find(params[:body_type])
      @theme     = Theme.find(params[:theme])
      @options   = Option.where(body_type_id: @body_type.id, theme_id: @theme.id, display: true).order("options.feature_id ASC").order("options.price ASC")
      @features  = cart_builder(@options)
    end  
  end
  
  # get you have the body type and theme id's or you have the product id's
  #  ask the options to get all the options for either of those combo's
  # sort those options first by feature then by price ASC
  #  remove unused features 
  #  send @features and @options to the html.erb view
  
end
