class StoreController < ApplicationController
  skip_before_filter :authorize

  def new
    if params[:instrument]
      @body_types     = BodyType.where(type_of: params[:instrument]).order("position ASC")
      @type_of        = [params[:instrument]]
    else
      @type_of        = TYPE_OF
      @body_types     = BodyType.order("position ASC")
    end
    @themes = Theme.all
  end
  
  def theme
    @theme = Theme.find(params[:id])
    @body_types = @theme.body_types
    @type_of = [@body_types.first.type_of]
    # prep to get instrument if necessary 
    # prep to get body_types from themes @theme.body_types
  end

  def new_themes
    @themes = Theme.all
    render 'new_themes'
  end
  
  def show_theme
    @body_type  = BodyType.all
    @theme      = Theme.find(params[:theme])
    @options    = Option.where(display: true).order("options.feature_id ASC").order("options.price ASC")
    @features   = cart_builder(@options)
    @cart_total = 3000
    
  end

  def themes
    if params[:id]
      @body_type = BodyType.find(params[:id])
    else 
      @body_type = BodyType.first
    end
    @themes = @body_type.themes
    @id = @body_type.id
    @msg1 = "Step 2: Choose A Body Type "
    @msg2 = "#{@body_type.name.capitalize}"
    
    respond_to do |format|
      format.html 
      format.js 
      format.xml  { head :ok }
    end
  end
  
  def index
    @page_title = "Shop"
    @cart = current_cart    
  end

  def body
    @cart = current_cart
    @type = params[:type]
    @instrument = Instrument.create(type_of: @type)
    
    case @type
    when 'mandolin'
      @body = BodyType.where(type_of: 'custom')
    when 'banjo' 
      @body = BodyType.where(type_of: 'custom')
    when 'lap_steel'
      @body = BodyType.where(type_of: 'custom')
    when 'guitar'
      @body = BodyType.where(type_of: @type)
    when 'bass'
      @body = BodyType.where(type_of: @type)
    end
  end
  
  def customize
    @instrument = Instrument.find(params[:id])
    @body = params[:body]
    body_type = BodyType.find_by_name(@body)
    @step = 'wood'
    @next_step = 'paint'
    @instrument.update_attributes(body_type_id: body_type.id, body: @body, price: body_type.price, step: @step)
    @type = @instrument.type_of
    @options = Option.all
    @features = Feature.where(type_of: @type).where(category: "#{@step}")
  end
  
  def paint
    # know the category and @instrument.id
    # get the instrument from the id
    stepper = [ 'wood' , 'paint' , 'neck', 'electronics' , 'accessories' ]

    @instrument = Instrument.find(params[:id])
    @type = @instrument.type_of
    step = @instrument.step
    index = stepper.index(step) + 1
    next_index = index + 1
    @step = stepper[index]
    @next_step = stepper[next_index]
    
    @body = BodyType.find(@instrument.body_type_id).name
    
    # find the features for that category & type_of
    @features = Feature.where(type_of: @type).where(category: "#{@step}")
    #  get just the right @options for the feature , body_type, type_of
    @options = Option.all
    # update the instrument with the defaults from those options
    # send @instrument @features @options -> to a form view
    #     the features are all the same for now , just make the options dynamic
    # have the form view ONLY render the proper radio buttons for the incoming info
    # have an update button on the bottom as 'continue'
    # receive that form and update_attributes on the @instrument.id
    # re-loop with new category
    render 'store/customize'
    
  end
  
  def build
    @product    = Product.find(params[:id])
    @prod       = product_hash
    @options    = Option.where(display: true).order("options.feature_id ASC").order("options.price ASC")
    @features   = cart_builder(@options)
    @body_type  = BodyType.find(@product.body_type_id)
    @theme      = Theme.find(@product.theme_id)
    @cart_price = @body_type.price + @theme.price  
  end
  
  def edit
    @product  = Product.find(params[:id])
    @features = Feature.all
    @feat     = feature_hash
    @prod     = product_hash
    @options  = Option.where(id: params[:id]).order("options.feature_id ASC").order("options.price ASC")
    @feature_list = @options.collect do |option|
      option.feature_id
    end
    @feature_list.uniq!
  end

  def show
    # @body_type  = BodyType.last   # workaround
    @body_type  = BodyType.find(params[:body_type]) 
    @theme      = Theme.find(params[:theme])
    @cart_price = @body_type.price + @theme.price    
    @options    = Option.where(display: true).order("options.feature_id ASC").order("options.price ASC")
    @features   = cart_builder(@options)
    @msg1_replace = "#{@body_type.name} : $#{@body_type.price}"
    @msg2 = "#{@theme.name} : $#{@theme.price}"
    @msg1 = "Step 3: Choose A Theme"
    @msg3 = "Step 4: Choose your Configuration"
    
    respond_to do |format|
      format.html 
      format.js 
      format.xml  { head :ok }
    end
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

  
end
