class Product < ActiveRecord::Base
  acts_as_list
  has_many :line_items
  has_many :orders, through: :line_items
  belongs_to :body_types
  belongs_to :themes
  before_destroy :ensure_not_referenced_by_any_line_item
  
  validates :name, :description, :image_url, :type_of, presence: true
  validates :price, numericality: {greater_than_or_equal_to: 0.01}
  validates :name, uniqueness: true
  validates :image_url, allow_blank: true, format: {
    with:   %r{\.(gif|jpg|png)$}i,
    message: 'must be a URL for GIF, JPG, or PNG image'
  }
  validates_length_of :name, :minimum => 3, :message => "atleast 3 characters"
	
	def self.ninja_list
		#  make sure the path is whatever is after 'app/assets/images'
		#  add as many image_url[index] as u need ... 
		
		image_url    = []
		
		image_url[0] = "webphotos/hornet.png"
		image_url[1] = "webphotos/castlewave.png"
		image_url[2] = "webphotos/darkhorse.png"
		image_url[3] = "webphotos/imperial.png"
		image_url[4] = "webphotos/roller.png"


		return image_url
	end
	
  private
  
  # ensure that there are no line items referencing the product
  def ensure_not_referenced_by_any_line_item
    if line_items.empty?
      return true
    else
      errors.add(:base, 'Line Items present')
      return false
    end
  end
end
