class MainController < ApplicationController

  def index
		@products = Product.ninja_list
	end

  def instruments
    @products = Product.where(type_of: params[:instrument]).order("products.position ASC")
    @type_of  = params[:instrument]
  end
  
  def guitars
    @product = Product.find(params[:id])
    @page_title = @product.name + " " + @product.type_of.capitalize
    @tag = TAG
    @thumb_folder = THUMB_FOLDER
    
    @image = []
    @image[1] = @product.photo_url_1.chomp!(".jpg") if !@product.photo_url_1.blank?
    @image[2] = @product.photo_url_2.chomp!(".jpg") if !@product.photo_url_2.blank?
    @image[3] = @product.photo_url_3.chomp!(".jpg") if !@product.photo_url_3.blank?
    @image[4] = @product.photo_url_4.chomp!(".jpg") if !@product.photo_url_4.blank?
    @image[5] = @product.photo_url_5.chomp!(".jpg") if !@product.photo_url_5.blank?
    @image[6] = @product.photo_url_6.chomp!(".jpg") if !@product.photo_url_6.blank?
    @image[7] = @product.photo_url_7.chomp!(".jpg") if !@product.photo_url_7.blank?
    @image[8] = @product.photo_url_8.chomp!(".jpg") if !@product.photo_url_8.blank?
    @image[0] = @product.image_url.chomp!(".png")
    if params[:image]
      i = params[:image].to_i
      @image[0] = @image[i]
      @image[i] = @product.image_url
      # BUG - this code does not know if same image is clicked twice, its ignorant of photo positions!!
      # i fixed it with an if statement in the view, but is there a better way ?
    end

    @options = Option.where(product_id: @product.id).order("options.feature_id ASC").order("options.price ASC")
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @product }
    end
  end
  
  def bass
    @product = Product.find(params[:id])
    @page_title = @product.name + " " + @product.type_of.capitalize
    @tag = TAG
    @thumb_folder = THUMB_FOLDER
    
    @image = []
    @image[1] = @product.photo_url_1.chomp!(".jpg") if !@product.photo_url_1.blank?
    @image[2] = @product.photo_url_2.chomp!(".jpg") if !@product.photo_url_2.blank?
    @image[3] = @product.photo_url_3.chomp!(".jpg") if !@product.photo_url_3.blank?
    @image[4] = @product.photo_url_4.chomp!(".jpg") if !@product.photo_url_4.blank?
    @image[5] = @product.photo_url_5.chomp!(".jpg") if !@product.photo_url_5.blank?
    @image[6] = @product.photo_url_6.chomp!(".jpg") if !@product.photo_url_6.blank?
    @image[7] = @product.photo_url_7.chomp!(".jpg") if !@product.photo_url_7.blank?
    @image[8] = @product.photo_url_8.chomp!(".jpg") if !@product.photo_url_8.blank?
    @image[0] = @product.image_url.chomp!(".png")
    if params[:image]
      i = params[:image].to_i
      @image[0] = @image[i]
      @image[i] = @product.image_url
      # BUG - this code does not know if same image is clicked twice, its ignorant of photo positions!!
      # i fixed it with an if statement in the view, but is there a better way ?
    end

    @options = Option.where(product_id: @product.id).order("options.feature_id ASC").order("options.price ASC")
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @product }
    end
  end
  
  def customs
    @product = Product.find(params[:id])
    @page_title = @product.name + " " + @product.type_of.capitalize
    @tag = TAG
    @thumb_folder = THUMB_FOLDER
    
    @image = []
    @image[1] = @product.photo_url_1.chomp!(".jpg") if !@product.photo_url_1.blank?
    @image[2] = @product.photo_url_2.chomp!(".jpg") if !@product.photo_url_2.blank?
    @image[3] = @product.photo_url_3.chomp!(".jpg") if !@product.photo_url_3.blank?
    @image[4] = @product.photo_url_4.chomp!(".jpg") if !@product.photo_url_4.blank?
    @image[5] = @product.photo_url_5.chomp!(".jpg") if !@product.photo_url_5.blank?
    @image[6] = @product.photo_url_6.chomp!(".jpg") if !@product.photo_url_6.blank?
    @image[7] = @product.photo_url_7.chomp!(".jpg") if !@product.photo_url_7.blank?
    @image[8] = @product.photo_url_8.chomp!(".jpg") if !@product.photo_url_8.blank?
    @image[0] = @product.image_url.chomp!(".png")
    if params[:image]
      i = params[:image].to_i
      @image[0] = @image[i]
      @image[i] = @product.image_url
      # BUG - this code does not know if same image is clicked twice, its ignorant of photo positions!!
      # i fixed it with an if statement in the view, but is there a better way ?
    end

    @options = Option.where(product_id: @product.id).order("options.feature_id ASC").order("options.price ASC")
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @product }
    end
  end
  
  def artists
    @artists = Artist.order("artists.position ASC")
    @products = Product.order("products.type_of DESC")
    @vid = " width=\"560\" height=\"315\" src=\"http://www.youtube.com/embed/-sxUX3CNjmg\" frameborder=\"0\" allowfullscreen"
    
  end
  
  def artist
    @artist = Artist.find(params[:id])
  end
  
  def themes
    @themes = Theme.order("position ASC")
    
  end
  
  def theme
    @theme = Theme.find(params[:id])
    @body_types = @theme.body_types
    # make @products = to all the insturments that have that theme which is not in the db
  end
  
  def repair
  end
  
end
