class MainController < ApplicationController

  def index
		@products = Product.ninja_list
	end

  def instrument
    @product = Product.find(params[:id])
    @page_title = make_page_title(@product)
    @image, @tag, @thumb_folder = image_booth(@product)
    @image = change_image(@image, params[:image], @product.image_url) if params[:image]
    @options = Option.where(product_id: @product.id).order("options.feature_id ASC").order("options.price ASC")
  end



  def guitars
    @products = Product.where(type_of: "guitar").order("products.position ASC")
    @type_of  = params[:instrument]
  end

  def instruments
    case params[:type_of]
    when 'guitar'  
      @products = Product.where(type_of: "guitar").order("products.position ASC")
    when 'bass'  
      @products = Product.where(type_of: "bass").order("products.position ASC")
    when 'custom'  
      @products = Product.where(type_of: "custom").order("products.position ASC")
    else
      @products = Product.order("products.position ASC")
    end
    @type_of  = params[:instrument]
  end
  

  def basses
    @products = Product.where(type_of: "bass").order("products.position ASC")
    @type_of  = params[:instrument]
  end
  
  def customs
    @products = Product.where(type_of: "custom").order("products.position ASC")
    @type_of  = params[:instrument]
  end
  
  def guitar
    @product = Product.find(params[:id])
    @page_title = make_page_title(@product)
    @image, @tag, @thumb_folder = image_booth(@product)
    @image = change_image(@image, params[:image], @product.image_url) if params[:image]
    @options = Option.where(product_id: @product.id).order("options.feature_id ASC").order("options.price ASC")

  end
  
  def bass
    @product = Product.find(params[:id])
    @page_title = make_page_title(@product)
    @image, @tag, @thumb_folder = image_booth(@product)
    @image = change_image(@image, params[:image], @product.image_url) if params[:image]
    @options = Option.where(product_id: @product.id).order("options.feature_id ASC").order("options.price ASC")
  end

  def custom
    @product = Product.find(params[:id])
    @page_title = make_page_title(@product)
    @image, @tag, @thumb_folder = image_booth(@product)
    @image = change_image(@image, params[:image], @product.image_url) if params[:image]
    @options = Option.where(product_id: @product.id).order("options.feature_id ASC").order("options.price ASC")

  end
  
  def artists
    @artists = Artist.order("artists.position ASC")
    @products = Product.order("products.type_of DESC")
    @tile = shuffle(@artists, @products)
    
    @vid = " width=\"560\" height=\"315\" src=\"http://www.youtube.com/embed/-sxUX3CNjmg\" frameborder=\"0\" allowfullscreen"
    case params[:type_of]
    when 'artist'  
      @tile = Artist.order("artists.position ASC")
    when 'instrument'  
      @tile = Product.order("products.position ASC")
    when 'video'  
      @tile = Artist.order("products.position ASC")
    else
      @artists = Artist.order("artists.position ASC")
      @products = Product.order("products.type_of DESC")
      @tile = shuffle(@artists, @products)
    end
    @type_of  = params[:type_of] 
    
    if @type_of == 'video'
     render 'video_feed', :artists => @artists
    else
      render 'artists'
    end   
    
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
  
  private
  
  def image_booth(product)
    image = []
    image[1] = product.photo_url_1.chomp!(".jpg") if !product.photo_url_1.blank?
    image[2] = product.photo_url_2.chomp!(".jpg") if !product.photo_url_2.blank?
    image[3] = product.photo_url_3.chomp!(".jpg") if !product.photo_url_3.blank?
    image[4] = product.photo_url_4.chomp!(".jpg") if !product.photo_url_4.blank?
    image[5] = product.photo_url_5.chomp!(".jpg") if !product.photo_url_5.blank?
    image[6] = product.photo_url_6.chomp!(".jpg") if !product.photo_url_6.blank?
    image[7] = product.photo_url_7.chomp!(".jpg") if !product.photo_url_7.blank?
    image[8] = product.photo_url_8.chomp!(".jpg") if !product.photo_url_8.blank?
    image[0] = product.image_url.chomp!(".png") 
    return image, TAG, THUMB_FOLDER  
  end
  
  def change_image(image, index, product_image)
    i = index.to_i
    image[0] = image[i]
    image[i] = product_image
    return image
  end
  
  def make_page_title(object)
    page_title = object.name + " " + object.type_of.capitalize
  end
  
  def shuffle(artists, products)
    count = artists.count
    if products.count > count
      count = products.count
    end
    i = 0
    total = []
    while i < count
      total << artists[i] if artists[i]
      total << products[i] if products[i]
      i += 1
    end
    return total
  end

  
end
