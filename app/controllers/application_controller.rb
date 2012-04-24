class ApplicationController < ActionController::Base
  protect_from_forgery
  # before_filter :authorize, except: 'main'
  
  TYPE_OF       = ['guitar', 'bass', 'custom']
  TAG           = "_thumbh.jpg"
  THUMB_FOLDER  = "Thumb H/"
  
  def counter
    @guitars = Product.where(type_of: "guitar").order("products.position ASC")
    @bass    = Product.where(type_of: "bass").order("products.position ASC")
    @customs = Product.where(type_of: "custom").order("products.position ASC")
  end
  
  
  private
  
    def current_cart
      Cart.find(session[:cart_id])
    rescue ActiveRecord::RecordNotFound
      cart = Cart.create
      session[:cart_id] = cart.id
      cart
    end
    
    def feature_array
      f = Feature.all
      f_array = []
      f.each do |fe|
        f_array << [fe.name, fe.id]
      end
      return f_array  
    end
    
    def feature_array_id_name
      f = Feature.all
      f_array = []
      f.each do |fe|
        f_array << [fe.id, fe.name]
      end
      return f_array  
    end
    
    def feature_hash
      f = Feature.order("position ASC")
      f_hash = {}
      f.each do |fe|
        f_hash[fe.id] = fe.name
      end
      return f_hash
    end

    def product_array
      p = Product.all
      p_array = []
      p.each do |fe|
        p_array << [fe.name, fe.id]
      end
      return p_array  
    end
    
    def product_array_id_name
      p = Product.all
      p_array = []
      p.each do |fe|
        p_array << [fe.id, fe.name]
      end
      return p_array  
    end
    
    def theme_array_id_name
      p = Theme.all
      p_array = []
      p.each do |fe|
        p_array << [fe.id, fe.name]
      end
      return p_array  
    end
    
    def body_type_array_id_name
      p = BodyType.all
      p_array = []
      p.each do |fe|
        p_array << [fe.id, fe.name]
      end
      return p_array  
    end
    
    def product_hash
      p = Product.all
      p_hash = {}
      p.each do |fe|
        p_hash[fe.id] = fe.name
      end
      return p_hash
    end
        
  protected
    
    def authorize
      unless User.find_by_id(session[:user_id])
        redirect_to login_url, notice: "Please log in"
      end
    end
end
